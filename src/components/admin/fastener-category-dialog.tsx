"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import SimpleImageUpload from "./simple-image-upload"
import { toast } from "sonner"

interface FastenerCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: any
  onSuccess: () => void
}

export function FastenerCategoryDialog({ open, onOpenChange, category, onSuccess }: FastenerCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    publicId: "",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        publicId: category.publicId || "",
        isActive: category.isActive ?? true,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        publicId: "",
        isActive: true,
      })
    }
  }, [category])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = category ? `/api/admin/fasteners/categories/${category.id}` : "/api/admin/fasteners/categories"
      const method = category ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save category")
      return response.json()
    },
    onSuccess: () => {
      toast.success(category ? "Category updated successfully" : "Category created successfully")
      onSuccess()
      onOpenChange(false)
      setIsSubmitting(false)
    },
    onError: (error) => {
      console.error("Mutation error:", error)
      toast.error("Failed to save category")
      setIsSubmitting(false)
    },
  })

  const handleImageChange = (url: string, publicId?: string) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
      publicId: publicId || "",
    }))
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
      publicId: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    mutation.mutate(formData)
  }

  const handleDelete = async () => {
    if (!category) return

    if (!confirm("Are you sure you want to delete this category? This will also delete all associated options.")) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/fasteners/categories/${category.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Category deleted successfully")
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      toast.error("Failed to delete category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-orange-600 dark:text-orange-400">
            {category ? "Edit Fastener Category" : "Add Fastener Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Bolts, Screws, Nuts"
              className="focus:ring-orange-500 focus:border-orange-500"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this fastener category"
              className="focus:ring-orange-500 focus:border-orange-500"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <SimpleImageUpload
            currentImageUrl={formData.image}
            currentPublicId={formData.publicId}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            label="Category Image"
            disabled={isLoading}
          />

          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              className="data-[state=checked]:bg-orange-500"
              disabled={isLoading}
            />
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Active Category
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only active categories will be visible to customers
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            {category && (
              <Button type="button" onClick={handleDelete} disabled={isLoading} className="bg-red-500 hover:bg-red-600">
                {isLoading ? "Deleting..." : "Delete Category"}
              </Button>
            )}
            <div className="flex space-x-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
                {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
