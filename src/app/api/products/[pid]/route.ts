import { cloudinary, uploadImage } from "@/config/cloudinary.config"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { error400, error401, error403, error500, success200 } from "@/lib/utils"
import { ZodProductSchema } from "@/lib/zod-schemas/schema"
import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import type { z } from "zod"
import { uid } from "uid"

// Function to delete a single image by public_id
async function deleteImage(publicId: string) {
  return cloudinary.api.delete_resources([publicId])
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
    return error500({})
  }
}

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

    if (result.success) {
      // Get current colors and new colors
      const currentColors = dbProduct.color ? dbProduct.color.split(",") : []
      const newColors = data.colors.map((colorObj) => colorObj.color).filter(Boolean)

      // Check if slug or colors have changed
      const isSlugChanged = dbProduct.slug !== data.slug
      const isColorsChanged = JSON.stringify(currentColors.sort()) !== JSON.stringify(newColors.sort())

      // Handle image processing for new/updated images
      const processedColors = await Promise.all(
        data.colors.map(async (colorVariant, index) => {
          const colorName = colorVariant.color
          if (!colorName) return colorVariant

          let processedThumbnail = colorVariant.thumbnail
          const processedOthers = [...colorVariant.others]

          

          // Process other images if they're new base64 images
          const processedOtherImages = await Promise.all(
            colorVariant.others.map(async (imageUrl, imgIndex) => {
              if (imageUrl.startsWith("data:")) {
                try {
                  const uploadResult = await  uploadImage(imageUrl, data.slug, colorName, uid())

                  // Save to database
                  await db.image.create({
                    data: {
                      productId: pid,
                      imagePublicId: uploadResult.public_id,
                      colorVariant: colorName,
                    },
                  })

                  return uploadResult.secure_url
                } catch (error) {
                  console.error("Error uploading other image:", error)
                  return imageUrl
                }
              }
              return imageUrl
            }),
          )
          // Process thumbnail if it's a new base64 image
          if (colorVariant.thumbnail && colorVariant.thumbnail.startsWith("data:")) {
            try {
              const uploadResult = await uploadImage(colorVariant.thumbnail, data.slug, colorName, `${uid()}-thumb`)
              processedThumbnail = uploadResult.secure_url

              // Save to database
              await db.image.create({
                data: {
                  productId: pid,
                  imagePublicId: uploadResult.public_id,
                  colorVariant: colorName,
                },
              })
            } catch (error) {
              console.error("Error uploading thumbnail:", error)
            }
          }

          return {
            ...colorVariant,
            thumbnail: processedThumbnail,
            others: processedOtherImages,
          }
        }),
      )

      // Handle color and slug changes
      if (isSlugChanged && isColorsChanged) {
        console.log("Both slug and colors changed")

        const removedColors = currentColors.filter((color) => !newColors.includes(color))
        const addedColors = newColors.filter((color) => !currentColors.includes(color))

        const resources = await cloudinary.api.resources({
          type: "upload",
          prefix: `products/${dbProduct.slug}/`,
          max_results: 500,
        })

        // Delete images of removed colors
        for (const removedColor of removedColors) {
          const colorImages = resources.resources.filter(
            (resource: any) =>
              resource.public_id.includes(`/${removedColor}/`) ||
              resource.public_id.includes(`-${removedColor}-`) ||
              resource.public_id.endsWith(`-${removedColor}`),
          )

          if (colorImages.length > 0) {
            await Promise.all(colorImages.map((img: any) => deleteImage(img.public_id)))
            await db.image.deleteMany({
              where: {
                productId: pid,
                colorVariant: removedColor,
              },
            })
          }
        }

        // Move remaining images to new slug path
        const remainingImages = resources.resources.filter((resource: any) => {
          return !removedColors.some(
            (color) =>
              resource.public_id.includes(`/${color}/`) ||
              resource.public_id.includes(`-${color}-`) ||
              resource.public_id.endsWith(`-${color}`),
          )
        })

        await Promise.all(
          remainingImages.map((resource: any) => {
            const publicId: string = resource.public_id
            const pathParts = publicId.split("/")

            const newPublicId =
              pathParts.length > 2
                ? `products/${data.slug}/${pathParts.slice(2).join("/")}`
                : `products/${data.slug}/${pathParts.at(-1)?.replace(dbProduct.slug, data.slug)}`

            return cloudinary.uploader.rename(publicId, newPublicId)
          }),
        )

        // Update imagePublicId in DB for remaining images
        const dbImages = await db.image.findMany({
          where: {
            productId: pid,
            imagePublicId: {
              contains: dbProduct.slug,
            },
            NOT: {
              colorVariant: {
                in: removedColors,
              },
            },
          },
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

      } else if (isSlugChanged) {
        console.log("Only slug changed")

        const resources = await cloudinary.api.resources({
          type: "upload",
          prefix: `products/${dbProduct.slug}/`,
          max_results: 500,
        })

        await Promise.all(
          resources.resources.map((resource: any) => {
            const publicId: string = resource.public_id
            const newPublicId = `products/${data.slug}/${publicId.split("/").slice(2).join("/")}`
            return cloudinary.uploader.rename(publicId, newPublicId)
          }),
        )

        const images = await db.image.findMany({
          where: {
            productId: pid,
            imagePublicId: {
              contains: dbProduct.slug,
            },
          },
        })

        await Promise.all(
          images.map((img) =>
            db.image.update({
              where: { id: img.id },
              data: {
                imagePublicId: img.imagePublicId.replace(dbProduct.slug, data.slug),
              },
            }),
          ),
        )

      } else if (isColorsChanged) {
        console.log("Only colors changed")

        const removedColors = currentColors.filter((color) => !newColors.includes(color))

        const resources = await cloudinary.api.resources({
          type: "upload",
          prefix: `products/${dbProduct.slug}/`,
          max_results: 500,
        })

        for (const removedColor of removedColors) {
          const colorImages = resources.resources.filter(
            (resource: any) =>
              resource.public_id.includes(`/${removedColor}/`) ||
              resource.public_id.includes(`-${removedColor}-`) ||
              resource.public_id.endsWith(`-${removedColor}`),
          )

          if (colorImages.length > 0) {
            await Promise.all(colorImages.map((img: any) => deleteImage(img.public_id)))
            await db.image.deleteMany({
              where: {
                productId: pid,
                colorVariant: removedColor,
              },
            })
          }
        }
      }

      // Update product in database
      await db.product.update({
        where: {
          id: pid,
        },
        data: {
          title: data.title,
          slug: data.slug,
          shortDescription: data.shortDescription === "" ? null : data.shortDescription,
          description: data.description,
          basePrice: Number.parseInt(data.basePrice),
          offerPrice: Number.parseInt(data.offerPrice),
          stock: Number.parseInt(data.stock),
          categoryId: data.categoryId,
          color: newColors.length > 0 ? newColors.join(",") : null,
          variantName: data.variantName,
          variantValues: data.variantValues?.replace(/\s/g, ""),
          keywords: data.keywords.replace(/\s/g, "").split(","),
        },
      })

      return success200({
        message: "Product updated successfully",
        processedColors: processedColors,
      })
    }

    if (result.error) {
      return error400("Invalid data format.", { errors: result.error.errors })
    }
  } catch (error) {
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
      })

      const deletePromises: Promise<any>[] = result.resources.map((resource: any) => deleteImage(resource.public_id))

      deletePromises.push(db.product.delete({ where: { id: pid } }))

      await Promise.all(deletePromises)

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
