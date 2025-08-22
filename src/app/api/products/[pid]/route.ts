import { cloudinary } from "@/config/cloudinary.config"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { error400, error401, error403, error500, success200 } from "@/lib/utils"
import { ZodProductSchema } from "@/lib/zod-schemas/schema"
import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import type { z } from "zod"

// Function to delete a single image by public_id
async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (e) {
    console.warn("Cloudinary destroy error:", e)
  }
}

// Function to rename images in Cloudinary when color changes
async function renameColorImages(oldSlug: string, newSlug: string, oldColor: string, newColor: string) {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: `products/${oldSlug}/${oldColor}/`,
      max_results: 500,
    })

    await Promise.all(
      resources.resources.map(async(resource: any) => {
        const oldId: string = resource.public_id
        const newId = oldId.replace(`products/${oldSlug}/${oldColor}/`, `products/${newSlug}/${newColor}/`)
        console.log(oldId,newId)
        if (oldId === newId) return Promise.resolve()
        const newVal =  await db.image.updateMany({
  where: { imagePublicId: oldId },
  data: { imagePublicId: newId, colorVariant: newColor },
});
console.log(newVal)
        return cloudinary.uploader.rename(oldId, newId)
      }),
    )
  } catch (error) {
    console.warn("Error renaming color images in Cloudinary:", error)
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
        Image: {
          orderBy: [
            { colorVariant: "asc" },
            { sequence: "asc" }, // Order by sequence within each color
          ],
        },
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
 * PUT: Edit product with targeted color-based image deletion and Cloudinary updates
 *
 * Key improvements:
 * - Uses color sequence matching from product.color field (comma-separated)
 * - Targets specific images for deletion based on color changes
 * - Updates Cloudinary images for both slug and color changes
 * - Maintains proper sequence without relying on colorIndex
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

    // Get current and new colors from comma-separated string
    const previousColors = dbProduct.color ? dbProduct.color.split(",").map((c) => c.trim()) : []
    const incomingColors = data.colors.map((c) => c.color).filter(Boolean)

    const isSlugChanged = dbProduct.slug !== data.slug

    // 1) Identify color changes by sequence position in comma-separated string
    const colorChanges: Array<{ from: string; to: string; position: number }> = []
    const colorsToDelete: string[] = []
    const colorsToAdd: Array<{ color: string; position: number }> = []

    // Find color changes at same positions
    const maxLength = Math.max(previousColors.length, incomingColors.length)
    for (let i = 0; i < maxLength; i++) {
      const oldColor = previousColors[i]
      const newColor = incomingColors[i]

      console.log(oldColor, newColor, i)

      if (oldColor && newColor && oldColor !== newColor) {
        // Color renamed at same position
        colorChanges.push({ from: oldColor, to: newColor, position: i })
      } else if (oldColor && !newColor) {
        // Color removed
        colorsToDelete.push(oldColor)
      } else if (!oldColor && newColor) {
        // Color added
        colorsToAdd.push({ color: newColor, position: i })
      }
    }

    console.log(colorChanges,colorsToDelete,colorsToAdd)

    // 2) Handle Cloudinary updates for color changes and slug changes
    for (const change of colorChanges) {
      // Update images in Cloudinary for color rename
      await renameColorImages(dbProduct.slug, data.slug, change.from, change.to)
     
    }

    // 3) Delete images for removed colors (targeted deletion)
    for (const colorToDelete of colorsToDelete) {
      // Get images for this specific color
      console.log("delete")
      const imagesToDelete = await db.image.findMany({
        where: {
          productId: pid,
          colorVariant: colorToDelete,
        },
        select: { id: true, imagePublicId: true },
      })

      // Delete from Cloudinary and database
      await Promise.all(
        imagesToDelete.map(async (img) => {
          await deleteImage(img.imagePublicId)
          await db.image.delete({ where: { id: img.id } })
        }),
      )
    }

    // 4) Handle slug changes for remaining images (if not already handled in color changes)
    if (isSlugChanged) {
      // Update remaining images that weren't affected by color changes
      const remainingImages = await db.image.findMany({
        where: {
          productId: pid,
          colorVariant: { notIn: colorChanges.map((c) => c.to) }, // Exclude already updated colors
        },
        select: { id: true, imagePublicId: true, colorVariant: true },
      })

      // Rename in Cloudinary
      await Promise.all(
        remainingImages.map(async (img) => {
          const oldId = img.imagePublicId
          const newId = oldId.replace(`products/${dbProduct.slug}/`, `products/${data.slug}/`)
          if (oldId !== newId) {
            await cloudinary.uploader.rename(oldId, newId)
            // Update database with new public_id
            await db.image.update({
              where: { id: img.id },
              data: { imagePublicId: newId },
            })
          }
        }),
      )
    }

    // 5) Load all existing images after updates
    const existingImages = await db.image.findMany({
      where: { productId: pid },
      select: { id: true, imagePublicId: true, colorVariant: true, sequence: true },
      orderBy: [{ colorVariant: "asc" }, { sequence: "asc" }],
    })
    console.log(existingImages)

    const findExistingByPublicId = (publicId: string) => existingImages.find((img) => img.imagePublicId === publicId)

    // Track all public_ids that should remain after processing
    const desiredPublicIds = new Set<string>()
    const imageUpdates: Array<{ id: string; sequence: number; colorVariant: string }> = []

    // 6) Process each color variant - maintain sequence based on color position
    const processedColors = await Promise.all(
      data.colors.map(async (variant, colorPosition) => {
        const colorName = variant.color
        if (!colorName) {
          return { color: "", others: [], thumbnail: "" }
        }

        const finalOthersPublicIds: string[] = []

        // Process thumbnail first (sequence -1)
        let finalThumbPublicId: string | null = null
        if (variant.thumbnail) {
          const publicId = variant.thumbnail
          desiredPublicIds.add(publicId)
          finalThumbPublicId = publicId

          // Create or update thumbnail record
          const existing = findExistingByPublicId(publicId)
          if (existing) {
            if (existing.colorVariant !== colorName || existing.sequence !== -1) {
              imageUpdates.push({ id: existing.id, sequence: -1, colorVariant: colorName })
            }
          } else {
            const created = await db.image.create({
              data: {
                productId: pid,
                imagePublicId: publicId,
                colorVariant: colorName,
                sequence: -1,
              },
              select: { id: true, imagePublicId: true, colorVariant: true, sequence: true },
            })
            existingImages.push(created)
          }
        }

        // Process "others" images in sequence
        if (variant.others && Array.isArray(variant.others)) {
          for (let i = 0; i < variant.others.length; i++) {
            let publicId: string
            let sequence: number

            if (typeof variant.others[i] === "string") {
              publicId = variant.others[i] as string
              sequence = i
            } else {
              const imageObj = variant.others[i] as any
              publicId = imageObj.publicId || imageObj
              sequence = imageObj.sequence !== undefined ? imageObj.sequence : i
            }

            desiredPublicIds.add(publicId)
            finalOthersPublicIds.push(publicId)

            // Create or update image record with proper sequence
            const existing = findExistingByPublicId(publicId)
            if (existing) {
              if (existing.colorVariant !== colorName || existing.sequence !== sequence) {
                imageUpdates.push({ id: existing.id, sequence, colorVariant: colorName })
              }
            } else {
              const created = await db.image.create({
                data: {
                  productId: pid,
                  imagePublicId: publicId,
                  colorVariant: colorName,
                  sequence,
                },
                select: { id: true, imagePublicId: true, colorVariant: true, sequence: true },
              })
              existingImages.push(created)
            }
          }
        }

        return {
          color: colorName,
          others: finalOthersPublicIds,
          thumbnail: finalThumbPublicId ?? "",
        }
      }),
    )

    // 7) Apply all image updates in batch
    await Promise.all(
      imageUpdates.map((update) =>
        db.image.update({
          where: { id: update.id },
          data: {
            sequence: update.sequence,
            colorVariant: update.colorVariant,
          },
        }),
      ),
    )

    // 8) Delete any remaining orphaned images (not in desired set)
    const allCurrentImages = await db.image.findMany({
      where: { productId: pid },
      select: { id: true, imagePublicId: true },
    })

    console.log(allCurrentImages)

    const imagesToDelete = allCurrentImages.filter((img) => !desiredPublicIds.has(img.imagePublicId))

    await Promise.all(
      imagesToDelete.map(async (img) => {
        await deleteImage(img.imagePublicId)
        await db.image.delete({ where: { id: img.id } })
      }),
    )

    // 9) Update product fields with new color sequence
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
      colorsDeleted: colorsToDelete, // Track what colors were deleted
      colorsAdded: colorsToAdd, // Track what colors were added
      imageUpdates: imageUpdates.length, // Track how many images were updated
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
