"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { FastenerCategoryDialog } from "@/components/admin/fastener-category-dialog"
import { FastenerOptionsDialog } from "@/components/admin/fastener-options-dialog"
import { toast } from "sonner"
import ProductType from "@/components/admin/product-type"
import { usePathname } from "next/navigation";
export default function AdminFastenersPage() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const queryClient = useQueryClient()
   const pathname = usePathname()

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-fastener-categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/fasteners/categories")
      return response.json()
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/admin/fasteners/categories/${categoryId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete category")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fastener-categories"] })
      toast.success("Category deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete category")
    },
  })

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category)
    setShowCategoryDialog(true)
  }

  const handleManageOptions = (category: any) => {
    setSelectedCategory(category)
    setShowOptionsDialog(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(categoryId)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (

    <div className="space-y-6 ">
      <div>
              <ProductType path={pathname} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-300">Fastener Categories</h1>
          <p className="text-gray-600">Manage fastener categories and their options</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null)
            setShowCategoryDialog(true)
          }}
          className="flex bg-orange-500"
        >
          <span><Plus className="w-4 h-4 mr-2" /></span>
          <span>Add Category</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.categories?.map((category: any) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline"  onClick={() => handleManageOptions(category)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline"  onClick={() => handleEditCategory(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline"  onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{category.options?.length || 0} options</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FastenerCategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        category={selectedCategory}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-fastener-categories"] })
          setShowCategoryDialog(false)
          setSelectedCategory(null)
        }}
      />

      <FastenerOptionsDialog
        open={showOptionsDialog}
        onOpenChange={setShowOptionsDialog}
        category={selectedCategory}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-fastener-categories"] })
        }}
      />
    </div>
  )
}
