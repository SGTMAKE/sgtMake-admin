"use client"

import { Form } from "@/components/ui/form"
import { ZodProductSchema } from "@/lib/zod-schemas/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import ProductDetails from "./components/product-details"
import ProductOptions from "./components/product-options"
import { useGlobalContext } from "@/context/store"
import { useEffect, useState } from "react"
import { useEditProduct } from "@/api-hooks/products/edit-product"
import type { EditProductProps } from "@/lib/types/types"

// Client-side Cloudinary upload function
async function uploadToCloudinary(file: File, slug: string, color: string, uniqueId: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append("public_id", `${slug}/${color}/${uniqueId}`)
  formData.append("folder", `products`)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  )

  if (!response.ok) {
    console.log(response)
    throw new Error("Failed to upload image")
  }

  const data = await response.json()
  return data.public_id
}

// Convert data URI to File
function dataURItoFile(dataURI: string, filename: string): File {
  const arr = dataURI.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const EditProductForm = ({ product }: { product: EditProductProps }) => {
  const { colorVariants, setColorVariants } = useGlobalContext()
  const [isUploading, setIsUploading] = useState(false)
  const [originalColorVariants, setOriginalColorVariants] = useState<any[]>([])

  const form = useForm<z.infer<typeof ZodProductSchema>>({
    resolver: zodResolver(ZodProductSchema),
    defaultValues: {
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription || "",
      description: product.description,
      categoryId: product.categoryId.toString(),
      stock: product.stock.toString(),
      basePrice: product.basePrice.toString(),
      offerPrice: product.offerPrice.toString(),
      colors: [{}],
      variantName: product.variantName || "",
      variantValues: product.variantValues || "",
      keywords: product.keywords.join(","),
    },
  })

  useEffect(() => {
    // Initialize color variants from product data with proper URLs/public_ids
    const initialColorVariants = product.colorVariants?.length
      ? product.colorVariants.map((color) => ({
          color: color.color || "Default",
          thumbnail: color.thumbnail?.url || "",
          others: color.others?.map((val) => val.url) || [],
        }))
      : [{ color: "Default", thumbnail: "", others: [] }]

    setColorVariants(initialColorVariants)
    setOriginalColorVariants(JSON.parse(JSON.stringify(initialColorVariants))) // Deep copy for comparison
  }, [product, setColorVariants])

  const onSuccess = () => {
    toast.success("Product updated successfully.")
    setIsUploading(false)
  }

  const onError = () => {
    toast.error("Failed to update product.")
    setIsUploading(false)
  }

  const edit_product_mutation = useEditProduct()

  // Detect changes in image sequences and additions/deletions
  function detectImageChanges() {
    const changes = {
      added: [] as Array<{ colorIndex: number; imageIndex: number; type: "thumbnail" | "others" }>,
      deleted: [] as Array<{ colorIndex: number; imageIndex: number; type: "thumbnail" | "others"; publicId: string }>,
      reordered: [] as Array<{ colorIndex: number; oldOrder: number[]; newOrder: number[] }>,
    }

    colorVariants.forEach((variant, colorIndex) => {
      const original = originalColorVariants[colorIndex]
      if (!original) return

      // Check thumbnail changes
      if (variant.thumbnail !== original.thumbnail) {
        if (variant.thumbnail.startsWith("data:")) {
          changes.added.push({ colorIndex, imageIndex: -1, type: "thumbnail" })
        }
        if (original.thumbnail && !variant.thumbnail) {
          changes.deleted.push({ colorIndex, imageIndex: -1, type: "thumbnail", publicId: original.thumbnail })
        }
      }

      // Check others changes
      const originalOthers = original.others || []
      const currentOthers = variant.others || []

      // Find added images (data URIs)
      currentOthers.forEach((img, index) => {
        if (img.startsWith("data:")) {
          changes.added.push({ colorIndex, imageIndex: index, type: "others" })
        }
      })

      

      interface ImageChangeDeleted {
        colorIndex: number
        imageIndex: number
        type: "thumbnail" | "others"
        publicId: string
      }

      

      originalOthers.forEach((img: string, index: number) => {
        if (!currentOthers.includes(img)) {
          changes.deleted.push({ colorIndex, imageIndex: index, type: "others", publicId: img } as ImageChangeDeleted)
        }
      })

      // Check for reordering
      const originalPublicIds: string[] = originalOthers.filter((img: string) => !img.startsWith("data:"))
      const currentPublicIds = currentOthers.filter((img) => !img.startsWith("data:"))

      if (JSON.stringify(originalPublicIds) !== JSON.stringify(currentPublicIds)) {
        changes.reordered.push({
          colorIndex,
          oldOrder: originalPublicIds.map((id) => originalOthers.indexOf(id)),
          newOrder: currentPublicIds.map((id) => currentOthers.indexOf(id)),
        })
      }
    })

    return changes
  }

  async function uploadImages(values: z.infer<typeof ZodProductSchema>) {
    setIsUploading(true)

    try {
      const imageChanges = detectImageChanges()

      const processedColors = await Promise.all(
        colorVariants.map(async (variant, colorIndex) => {
          if (!variant.color) return variant

          const processedOthers: Array<{ publicId: string; sequence: number }> = []
          let processedThumbnail = ""

          // Process "others" images in sequence with proper ordering
          for (let i = 0; i < variant.others.length; i++) {
            const imageData = variant.others[i]
            if (imageData.startsWith("data:")) {
              // New image - upload to Cloudinary
              const file = dataURItoFile(imageData, `other-${i}.jpg`)
              const publicId = await uploadToCloudinary(file, values.slug, variant.color, `${Date.now()}-${i}`)
              processedOthers.push({ publicId, sequence: i })
            } else {
              // Existing image - keep public_id with updated sequence
              processedOthers.push({ publicId: imageData, sequence: i })
            }
          }

          // Process thumbnail
          if (variant.thumbnail && variant.thumbnail.startsWith("data:")) {
            // New thumbnail - upload to Cloudinary
            const file = dataURItoFile(variant.thumbnail, "thumbnail.jpg")
            const publicId = await uploadToCloudinary(file, values.slug, variant.color, `${Date.now()}-thumb`)
            processedThumbnail = publicId
          } else if (variant.thumbnail) {
            // Existing thumbnail - keep public_id
            processedThumbnail = variant.thumbnail
          }

          // Return in the expected format: others as string[]
          return {
            color: variant.color,
            others: processedOthers.map(o => o.publicId),
            thumbnail: processedThumbnail,
          }
        }),
      )

      // Update form with processed colors containing public_ids and sequences
      const updatedValues = {
        ...values,
        colors: processedColors,
        imageChanges, // Include change detection
      }

      setIsUploading(false)

      edit_product_mutation.mutate({ pid: product.id, values: updatedValues })
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images")
      setIsUploading(false)
    }
  }

  function setColors() {
    // Filter out empty color variants
    const validColorVariants = colorVariants.filter((variant) => variant.color.trim() !== "")
    form.setValue("colors", validColorVariants)
  }

  async function onSubmit(values: z.infer<typeof ZodProductSchema>) {
    setColors()
    await uploadImages(values)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-dark">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 rounded-lg border bg-white shadow-lg dark:bg-dark"
        >
          <div className="flex flex-col lg:flex-row">
            <ProductDetails form={form} />
            <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
              <ProductOptions form={form} />
            </div>
          </div>
          <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-3">
              <Button type="button" variant="bordered" onClick={() => window.history.back()} className="px-6">
                Cancel
              </Button>
              <Button
                isLoading={edit_product_mutation.isPending || isUploading}
                type="submit"
                color="primary"
                onClick={setColors}
                className="px-6"
              >
                {isUploading ? "Uploading Images..." : edit_product_mutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EditProductForm
