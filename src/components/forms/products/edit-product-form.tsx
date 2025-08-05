"use client"

import { Form } from "@/components/ui/form"
import { ZodProductSchema } from "@/lib/zod-schemas/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import ProductDetails from "./components/product-details"
import ProductOptions from "./components/product-options"
import { useGlobalContext } from "@/context/store"
import { useEffect } from "react"
import { useEditProduct } from "@/api-hooks/products/edit-product"
import type { EditProductProps } from "@/lib/types/types"

const EditProductForm = ({ product }: { product: EditProductProps }) => {
  const { colorVariants, setColorVariants } = useGlobalContext()

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
    // Initialize color variants from product data
    const initialColorVariants = product.colorVariants?.length
      ? product.colorVariants.map((color) => ({
          color: color.color || "Default",
          thumbnail: color.thumbnail?.url ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${color.thumbnail.url}` : "",
          others: color.others?.map((val) => `${process.env.NEXT_PUBLIC_IMAGE_URL}${val.url}`) || [],
        }))
      : [{ color: "Default", thumbnail: "", others: [] }]

    setColorVariants(initialColorVariants)
  }, [product, setColorVariants])

  const edit_product_mutation = useEditProduct()

  function setColors() {
    // Filter out empty color variants
    const validColorVariants = colorVariants.filter((variant) => variant.color.trim() !== "")
    form.setValue("colors", validColorVariants)
  }

  async function onSubmit(values: z.infer<typeof ZodProductSchema>) {
    setColors()
    edit_product_mutation.mutate({ pid: product.id, values })
  }

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-dark">
      

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 rounded-lg border bg-white shadow-lg  dark:bg-dark"
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
                isLoading={edit_product_mutation.isPending}
                type="submit"
                color="primary"
                onClick={setColors}
                className="px-6"
              >
                {edit_product_mutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EditProductForm
