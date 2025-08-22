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
import { useAddProduct } from "@/api-hooks/products/add-product"
import { useState, useEffect } from "react"

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

const AddProductForm = () => {
  const { colorVariants, setColorVariants } = useGlobalContext()
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof ZodProductSchema>>({
    resolver: zodResolver(ZodProductSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      categoryId: "",
      stock: "",
      basePrice: "",
      offerPrice: "",
      colors: [{}],
      variantName: "",
      variantValues: "",
      keywords: "",
    },
  })
  useEffect(() => {
      setColorVariants([{ color: "", thumbnail: "", others: [] }])
  }, [colorVariants.length, setColorVariants])

  // Initialize with one empty color variant
  useEffect(() => {
    if (colorVariants.length === 0) {
      setColorVariants([{ color: "", thumbnail: "", others: [] }])
    }
  }, [colorVariants.length, setColorVariants])

  const onSuccess = () => {
    toast.success("Product added successfully.")
    form.reset()
    setColorVariants([{ color: "", thumbnail: "", others: [] }])
    setIsUploading(false)
  }

  const onError = () => {
    toast.error("Failed to add product.")
    setIsUploading(false)
  }

  const add_product_mutation = useAddProduct(onSuccess)

  async function uploadImages(values: z.infer<typeof ZodProductSchema>) {
    setIsUploading(true)

    try {
      const processedColors = await Promise.all(
        colorVariants.map(async (variant, colorIndex) => {
          if (!variant.color) return variant

          const processedOthers: Array<{ publicId: string; sequence: number }> = []
          let processedThumbnail = ""

          // Upload "others" images in sequence with proper ordering
          for (let i = 0; i < variant.others.length; i++) {
            const imageData = variant.others[i]
            if (imageData.startsWith("data:")) {
              const file = dataURItoFile(imageData, `other-${i}.jpg`)
              const publicId = await uploadToCloudinary(file, values.slug, variant.color, `${Date.now()}-${i}`)
              processedOthers.push({ publicId, sequence: i })
            } else {
              // Already a public_id
              processedOthers.push({ publicId: imageData, sequence: i })
            }
          }

          // Upload thumbnail
          if (variant.thumbnail && variant.thumbnail.startsWith("data:")) {
            const file = dataURItoFile(variant.thumbnail, "thumbnail.jpg")
            const publicId = await uploadToCloudinary(file, values.slug, variant.color, `${Date.now()}-thumb`)
            processedThumbnail = publicId
          } else if (variant.thumbnail) {
            processedThumbnail = variant.thumbnail
          }

          return {
            color: variant.color,
            others: processedOthers,
            thumbnail: processedThumbnail,
            colorSequence: colorIndex, // Track color variant sequence
          }
        }),
      )

      // Update form with processed colors containing public_ids and sequences
      const updatedValues = {
        ...values,
        colors: processedColors.map((variant) => ({
          color: variant.color,
          thumbnail: variant.thumbnail,
          others: Array.isArray(variant.others)
            ? variant.others.map((img: any) => typeof img === "string" ? img : img.publicId)
            : [],
        })),
      }

      add_product_mutation.mutate(updatedValues)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images")
      setIsUploading(false)
    }
  }

  function setColors() {
    form.setValue("colors", colorVariants)
  }

  async function onSubmit(values: z.infer<typeof ZodProductSchema>) {
    setColors()
    await uploadImages(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border bg-white shadow-md dark:bg-dark"
      >
        <div className="flex flex-col md:flex-row">
          <ProductDetails form={form} />
          <ProductOptions form={form} />
        </div>
        <div className="flex justify-end border-t p-5">
          <Button
            isLoading={add_product_mutation.isPending || isUploading}
            type="submit"
            color="primary"
            onClick={setColors}
            isDisabled={!form.formState.isDirty}
          >
            {isUploading ? "Uploading Images..." : add_product_mutation.isPending ? "Adding Product..." : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AddProductForm
