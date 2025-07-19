"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Settings, Trash2 } from "lucide-react"
import { ConnectorCategoryDialog } from "@/components/admin/connector-category-dialog"
import { ConnectorOptionsDialog } from "@/components/admin/connector-options-dialog"
import Image from "next/image"
import { toast } from "sonner"
import { usePathname } from "next/navigation";
import ProductType from "@/components/admin/product-type"

const ConnectorsWiresAdmin = () => {
  const [selectedTab, setSelectedTab] = useState("connectors")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const queryClient = useQueryClient()
  const pathname = usePathname();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["connector-categories", selectedTab],
    queryFn: async () => {
      const response = await fetch(`/api/admin/connectors/categories?type=${selectedTab}`)
      return response.json()
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

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will also delete all associated options.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/connectors/categories/${category.id}?type=${selectedTab}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Category deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["connector-categories", selectedTab] })
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["connector-categories", selectedTab] })
    setShowCategoryDialog(false)
    setShowOptionsDialog(false)
    setSelectedCategory(null)
  }

  const categoryType = selectedTab === "connectors" ? "Connector" : "Wire"

  return (
      <div className="flex w-full flex-col justify-start">
        <div className="w-full">
          <div className="space-y-6">
            
      <div>
        <ProductType path={pathname} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connectors & Wires </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage connector and wire categories with their options</p>
        </div>
      </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-orange-100 dark:bg-orange-900">
                <TabsTrigger
                  value="connectors"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Connectors
                </TabsTrigger>
                <TabsTrigger value="wires" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Wires
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{categoryType} Categories</h2>
                  <Button
                    onClick={() => {
                      setSelectedCategory(null)
                      setShowCategoryDialog(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {categoryType} Category
                  </Button>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.categories?.map((category: any) => (
                      <Card
                        key={category.id}
                        className="group hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-gray-900 dark:text-white">{category.name}</CardTitle>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {category.image && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <Image
                                src={category.image.startsWith("http")? category.image: `${process.env.NEXT_PUBLIC_IMAGE_URL}/image/upload/${category.image}` || "/placeholder.svg"}
                                alt={category.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {category.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{category.options?.length || 0} options</span>
                            <span>Created {new Date(category.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              onClick={() => handleEditCategory(category)}
                              className="flex-1 hover:bg-orange-50 hover:border-orange-300"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleManageOptions(category)}
                              className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Options
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeleteCategory(category)}
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )) || (
                      <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                          <Plus className="w-12 h-12 mx-auto mb-4" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No {categoryType} Categories
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Get started by creating your first {categoryType.toLowerCase()} category
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedCategory(null)
                            setShowCategoryDialog(true)
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add {categoryType} Category
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <ConnectorCategoryDialog
              open={showCategoryDialog}
              onOpenChange={setShowCategoryDialog}
              category={selectedCategory}
              type={selectedTab as "connectors" | "wires"}
              onSuccess={handleSuccess}
            />

            <ConnectorOptionsDialog
              open={showOptionsDialog}
              onOpenChange={setShowOptionsDialog}
              category={selectedCategory}
              type={selectedTab as "connectors" | "wires"}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
  )
}

export default ConnectorsWiresAdmin
