import { cloudinary } from "@/config/cloudinary.config"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { error400, error401, error403, error500, success200 } from "@/lib/utils"
import { ZodProductSchema } from "@/lib/zod-schemas/schema"
import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import type { z } from "zod"

// Helpers
function isDataUri(v?: string | null): v is string {
  return !!v && v.startsWith("data:")
}

// Function to delete a single image by public_id
async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (e) {
    console.warn("Cloudinary destroy error:", e)
  }
}

export async function GET(req: NextRequest, { params }: { params: { pid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized")
    }

    const pid = params.pid
    if (!pid || pid.length < 20) {
      return error400("Invalid product ID", {})
    }

    const product = await db.product.findUnique({
      where: {
        id: pid,
      },
      include: {
        Image: true,
      },
    })

    if (!product) {
      return error400("Invalid product ID", {})
    }

    if (product.isDeleted) {
      return error400("Product has been deleted and is no longer accessible", {})
    }

    return success200({ product })
  } catch (error) {
    console.error("GET /api/products/[pid] error:", error)
    return error500({})
  }
}

/**
 * PUT: Edit product with smart color change handling and client-side uploads
 *
 * Key improvements:
 * - Expects public_ids from client-side uploads (no server-side uploading)
 * - Track color renames by index position and update DB records instead of deleting
 * - Only delete images that are truly removed from the payload
 * - Preserve existing images when colors are renamed
 * - Maintain proper sequence for different color sections
 */
export async function PUT(req: NextRequest, { params }: { params: { pid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized")
    }

    if (session.user.role !== "SUPERADMIN") {
      return error403()
    }

    const pid = params.pid
    if (!pid || pid.length < 20) {
      return error400("Invalid product ID", {})
    }

    const data: z.infer<typeof ZodProductSchema> = await req.json()
    if (!data) {
      return error400("Invalid data format.", {})
    }
    const result = ZodProductSchema.safeParse(data)

    if (!result.success) {
      return error400("Invalid data format.", { errors: result.error.errors })
    }

    const dbProduct = await db.product.findUnique({
      where: {
        id: pid,
      },
      select: {
        slug: true,
        color: true,
        isDeleted: true,
      },
    })

    if (!dbProduct) return error400("Product with this ID not found", {})

    if (dbProduct.isDeleted) {
      return error400("Cannot edit a deleted product", {})
    }

    // Get current and new colors
    const previousColors = dbProduct.color ? dbProduct.color.split(",") : []
    const incomingColors = data.colors.map((c) => c.color).filter(Boolean)

    const isSlugChanged = dbProduct.slug !== data.slug

    // 1) Track color changes by index position to identify renames vs additions/removals
    const colorChanges: Array<{ from: string; to: string; index: number }> = []
    const minLen = Math.min(previousColors.length, incomingColors.length)

    for (let i = 0; i < minLen; i++) {
      const from = previousColors[i]
      const to = incomingColors[i]
      if (from && to && from !== to) {
        colorChanges.push({ from, to, index: i })
      }
    }

    // 2) Apply color renames in database (update colorVariant, don't delete images)
    for (const change of colorChanges) {
      await db.image.updateMany({
        where: {
          productId: pid,
          colorVariant: change.from,
        },
        data: {
          colorVariant: change.to,
        },
      })
    }

    // 3) Load all existing images after color updates
    const existingImages = await db.image.findMany({
      where: { productId: pid },
      select: { id: true, imagePublicId: true, colorVariant: true },
    })

    const findExistingByPublicId = (publicId: string) => existingImages.find((img) => img.imagePublicId === publicId)

    // Track all public_ids that should remain after processing
    const desiredPublicIds = new Set<string>()

    // 4) Process each color variant - maintain sequence
    const processedColors = await Promise.all(
      data.colors.map(async (variant, variantIndex) => {
        const colorName = variant.color
        if (!colorName) {
          return { color: "", others: [], thumbnail: "" }
        }

        const finalOthersPublicIds: string[] = []

        // Process "others" images in sequence
        for (let i = 0; i < variant.others.length; i++) {
          const publicId = variant.others[i]
          desiredPublicIds.add(publicId)
          finalOthersPublicIds.push(publicId)

          // Create or update image record
          const existing = findExistingByPublicId(publicId)
          if (existing) {
            // Update existing record if color changed
            if (existing.colorVariant !== colorName) {
              await db.image.update({
                where: { id: existing.id },
                data: { colorVariant: colorName },
              })
              existing.colorVariant = colorName
            }
          } else {
            // Create new image record
            const created = await db.image.create({
              data: {
                productId: pid,
                imagePublicId: publicId,
                colorVariant: colorName,
              },
              select: { id: true, imagePublicId: true, colorVariant: true },
            })
            existingImages.push(created)
          }
        }

        // Process thumbnail
        let finalThumbPublicId: string | null = null
        if (variant.thumbnail) {
          const publicId = variant.thumbnail
          desiredPublicIds.add(publicId)
          finalThumbPublicId = publicId

          // Create or update thumbnail record
          const existing = findExistingByPublicId(publicId)
          if (existing) {
            if (existing.colorVariant !== colorName) {
              await db.image.update({
                where: { id: existing.id },
                data: { colorVariant: colorName },
              })
              existing.colorVariant = colorName
            }
          } else {
            const created = await db.image.create({
              data: {
                productId: pid,
                imagePublicId: publicId,
                colorVariant: colorName,
              },
              select: { id: true, imagePublicId: true, colorVariant: true },
            })
            existingImages.push(created)
          }
        }

        return {
          color: colorName,
          others: finalOthersPublicIds,
          thumbnail: finalThumbPublicId ?? "",
        }
      }),
    )

    // 5) Delete only images that are truly removed (not in desired set)
    const allCurrentImages = await db.image.findMany({
      where: { productId: pid },
      select: { id: true, imagePublicId: true },
    })

    const imagesToDelete = allCurrentImages.filter((img) => !desiredPublicIds.has(img.imagePublicId))

    await Promise.all(
      imagesToDelete.map(async (img) => {
        await deleteImage(img.imagePublicId)
        await db.image.delete({ where: { id: img.id } })
      }),
    )

    // 6) Handle slug changes - rename assets and update DB
    if (isSlugChanged) {
      const resources = await cloudinary.api.resources({
        type: "upload",
        prefix: `products/${dbProduct.slug}/`,
        max_results: 500,
      })

      // Rename assets in Cloudinary
      await Promise.all(
        resources.resources.map((resource: any) => {
          const oldId: string = resource.public_id
          const newId = `products/${data.slug}/${oldId.split("/").slice(2).join("/")}`
          if (oldId === newId) return Promise.resolve()
          return cloudinary.uploader.rename(oldId, newId)
        }),
      )

      // Update DB imagePublicIds
      const dbImages = await db.image.findMany({
        where: {
          productId: pid,
          imagePublicId: { contains: dbProduct.slug },
        },
        select: { id: true, imagePublicId: true },
      })

      await Promise.all(
        dbImages.map((img) =>
          db.image.update({
            where: { id: img.id },
            data: {
              imagePublicId: img.imagePublicId.replace(dbProduct.slug, data.slug),
            },
          }),
        ),
      )

      // Update response public_ids too
      for (const variant of processedColors as Array<{ color: string; others: string[]; thumbnail: string }>) {
        variant.others = variant.others.map((p) =>
          p.includes(dbProduct.slug) ? p.replace(dbProduct.slug, data.slug) : p,
        )
        if (variant.thumbnail) {
          variant.thumbnail = variant.thumbnail.includes(dbProduct.slug)
            ? variant.thumbnail.replace(dbProduct.slug, data.slug)
            : variant.thumbnail
        }
      }
    }

    // 7) Update product fields
    await db.product.update({
      where: { id: pid },
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription === "" ? null : data.shortDescription,
        description: data.description,
        basePrice: Number.parseInt(data.basePrice),
        offerPrice: Number.parseInt(data.offerPrice),
        stock: Number.parseInt(data.stock),
        categoryId: data.categoryId,
        color: incomingColors.length > 0 ? incomingColors.join(",") : null,
        variantName: data.variantName,
        variantValues: data.variantValues?.replace(/\s/g, ""),
        keywords: data.keywords.replace(/\s/g, "").split(","),
      },
    })

    return success200({
      message: "Product updated successfully",
      processedColors,
      colorChanges, // Track what colors were renamed
    })
  } catch (error) {
    console.error("PUT /api/products/[pid] error:", error)
    return error500({})
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { pid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return error401("Unauthorized")
    }

    if (session.user.role !== "SUPERADMIN") {
      return error403()
    }

    const pid = params.pid
    if (!pid || pid.length < 20) {
      return error400("Invalid product ID", {})
    }

    const dbProduct = await db.product.findUnique({
      where: { id: pid, isDeleted: false },
      select: {
        slug: true,
        isDeleted: true,
        purchases: true,
      },
    })

    if (!dbProduct) {
      return error400("Product with this ID not found", {})
    }

    if (dbProduct.purchases === 0) {
      // Hard delete - remove images, then delete record
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: `products/${dbProduct.slug}/`,
        max_results: 500,
      })

      await Promise.all(result.resources.map((resource: any) => deleteImage(resource.public_id)))
      await db.product.delete({ where: { id: pid } })

      return success200({ message: "Product permanently deleted." })
    } else {
      // Soft delete the product
      await db.product.update({
        where: { id: pid },
        data: { isDeleted: true },
      })

      return success200({ message: "Product soft deleted successfully." })
    }
  } catch (error) {
    console.error("DELETE product error:", error)
    return error500({})
  }
}
