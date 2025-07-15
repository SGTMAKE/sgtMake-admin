"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react"
import SimpleImageUpload from "./simple-image-upload"
import { toast } from "sonner"
import Image from "next/image"

interface FastenerOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: any
  onSuccess: () => void
}

interface OptionValue {
  value: string
  image?: string
  publicId?: string
}

export function FastenerOptionsDialog({ open, onOpenChange, category, onSuccess }: FastenerOptionsDialogProps) {
  const [selectedOption, setSelectedOption] = useState<any>(null)
  const [showOptionForm, setShowOptionForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [optionFormData, setOptionFormData] = useState({
    name: "",
    label: "",
    type: "select",
    required: false,
    helpText: "",
    values: [] as OptionValue[],
  })
  const [newValue, setNewValue] = useState("")
  const [showImageUpload, setShowImageUpload] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { data: options } = useQuery({
    queryKey: ["fastener-options", category?.id],
    queryFn: async () => {
      if (!category?.id) return { options: [] }
      const response = await fetch(`/api/admin/fasteners/categories/${category.id}/options`)
      return response.json()
    },
    enabled: !!category?.id && open,
  })

  const saveOptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = selectedOption
        ? `/api/admin/fasteners/options/${selectedOption.id}`
        : `/api/admin/fasteners/categories/${category.id}/options`
      const method = selectedOption ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save option")
      return response.json()
    },
    onSuccess: () => {
      toast.success(selectedOption ? "Option updated successfully" : "Option created successfully")
      queryClient.invalidateQueries({ queryKey: ["fastener-options", category?.id] })
      setShowOptionForm(false)
      setSelectedOption(null)
      resetOptionForm()
      setIsSubmitting(false)
    },
    onError: (error) => {
      console.error("Save option error:", error)
      toast.error("Failed to save option")
      setIsSubmitting(false)
    },
  })

  const deleteOptionMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const response = await fetch(`/api/admin/fasteners/options/${optionId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete option")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Option deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["fastener-options", category?.id] })
    },
    onError: () => {
      toast.error("Failed to delete option")
    },
  })

  const resetOptionForm = () => {
    setOptionFormData({
      name: "",
      label: "",
      type: "select",
      required: false,
      helpText: "",
      values: [],
    })
    setNewValue("")
    setShowImageUpload(null)
  }

  const handleEditOption = (option: any) => {
    setSelectedOption(option)
    setOptionFormData({
      name: option.name || "",
      label: option.label || "",
      type: option.type || "select",
      required: option.required || false,
      helpText: option.helpText || "",
      values: option.values || [],
    })
    setShowOptionForm(true)
  }

  const handleDeleteOption = (optionId: string) => {
    if (confirm("Are you sure you want to delete this option?")) {
      deleteOptionMutation.mutate(optionId)
    }
  }

  const handleAddValue = () => {
    if (newValue.trim()) {
      setOptionFormData({
        ...optionFormData,
        values: [...optionFormData.values, { value: newValue.trim() }],
      })
      setNewValue("")
    }
  }

  const handleRemoveValue = (index: number) => {
    setOptionFormData({
      ...optionFormData,
      values: optionFormData.values.filter((_, i) => i !== index),
    })
  }

  const handleValueImageChange = (index: number, url: string, publicId?: string) => {
    const updatedValues = [...optionFormData.values]
    updatedValues[index] = {
      ...updatedValues[index],
      image: url,
      publicId: publicId || updatedValues[index].publicId,
    }
    setOptionFormData({
      ...optionFormData,
      values: updatedValues,
    })
  }

  const handleValueImageRemove = (index: number) => {
    const updatedValues = [...optionFormData.values]
    updatedValues[index] = {
      ...updatedValues[index],
      image: "",
      publicId: "",
    }
    setOptionFormData({
      ...optionFormData,
      values: updatedValues,
    })
  }

  const handleSubmitOption = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    saveOptionMutation.mutate(optionFormData)
  }

  const isLoading = isSubmitting || saveOptionMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-orange-600 dark:text-orange-400">
            Manage Options for {category?.name}
          </DialogTitle>
        </DialogHeader>

        {!showOptionForm ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Configuration Options</h3>
              <Button
                onClick={() => {
                  setSelectedOption(null)
                  resetOptionForm()
                  setShowOptionForm(true)
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="grid gap-4">
              {options?.options?.map((option: any) => (
                <Card key={option.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-gray-900 dark:text-white">{option.label}</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditOption(option)}
                          className="hover:bg-orange-50 hover:border-orange-300"
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteOption(option.id)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          disabled={deleteOptionMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <p>
                          <strong className="text-orange-600 dark:text-orange-400">Name:</strong> {option.name}
                        </p>
                        <p>
                          <strong className="text-orange-600 dark:text-orange-400">Type:</strong> {option.type}
                        </p>
                      </div>
                      <p>
                        <strong className="text-orange-600 dark:text-orange-400">Required:</strong>{" "}
                        <span className={option.required ? "text-red-600" : "text-green-600"}>
                          {option.required ? "Yes" : "No"}
                        </span>
                      </p>
                      {option.helpText && (
                        <p>
                          <strong className="text-orange-600 dark:text-orange-400">Help Text:</strong> {option.helpText}
                        </p>
                      )}
                      {option.values && option.values.length > 0 && (
                        <div>
                          <strong className="text-orange-600 dark:text-orange-400">Values:</strong>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                            {option.values.map((valueObj: OptionValue, index: number) => (
                              <div key={index} className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                                {valueObj.image && (
                                  <div className="relative w-full h-16 mb-2 rounded overflow-hidden">
                                    <Image
                                      src={valueObj.image || "/placeholder.svg"}
                                      alt={valueObj.value}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <span className="text-xs font-medium text-center block">{valueObj.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No options configured for this category
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOption} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Field Name
                </Label>
                <Input
                  id="name"
                  value={optionFormData.name}
                  onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                  placeholder="e.g., thread_size, material"
                  className="focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="label" className="text-sm font-medium">
                  Display Label
                </Label>
                <Input
                  id="label"
                  value={optionFormData.label}
                  onChange={(e) => setOptionFormData({ ...optionFormData, label: e.target.value })}
                  placeholder="e.g., Thread Size, Material"
                  className="focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-sm font-medium">
                  Input Type
                </Label>
                <Select
                  value={optionFormData.type}
                  onValueChange={(value) => setOptionFormData({ ...optionFormData, type: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Single Select</SelectItem>
                    <SelectItem value="multiselect">Multi Select</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="number">Number Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-3 pt-6">
                <Switch
                  id="required"
                  checked={optionFormData.required}
                  onCheckedChange={(checked) => setOptionFormData({ ...optionFormData, required: checked })}
                  className="data-[state=checked]:bg-orange-500"
                  disabled={isLoading}
                />
                <Label htmlFor="required" className="text-sm font-medium cursor-pointer">
                  Required Field
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="helpText" className="text-sm font-medium">
                Help Text
              </Label>
              <Textarea
                id="helpText"
                value={optionFormData.helpText}
                onChange={(e) => setOptionFormData({ ...optionFormData, helpText: e.target.value })}
                placeholder="Optional help text to guide users"
                className="focus:ring-orange-500 focus:border-orange-500"
                disabled={isLoading}
                rows={2}
              />
            </div>

            {(optionFormData.type === "select" || optionFormData.type === "multiselect") && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Option Values</Label>

                <div className="flex space-x-2">
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Add a value option"
                    className="focus:ring-orange-500 focus:border-orange-500"
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddValue}
                    disabled={isLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionFormData.values.map((valueObj, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{valueObj.value}</span>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowImageUpload(showImageUpload === index ? null : index)}
                              className="p-2"
                              disabled={isLoading}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveValue(index)}
                              className="p-2 hover:bg-red-50 hover:text-red-600"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {valueObj.image && (
                          <div className="relative w-full h-20 rounded overflow-hidden">
                            <Image
                              src={valueObj.image || "/placeholder.svg"}
                              alt={valueObj.value}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {showImageUpload === index && (
                          <SimpleImageUpload
                            currentImageUrl={valueObj.image}
                            currentPublicId={valueObj.publicId}
                            onImageChange={(url, publicId) => handleValueImageChange(index, url, publicId)}
                            onImageRemove={() => handleValueImageRemove(index)}
                            label={`Image for ${valueObj.value}`}
                            disabled={isLoading}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptionForm(false)}
                disabled={isLoading}
                className="border-gray-300 hover:bg-gray-50"
              >
                Back to Options
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
                {isLoading ? "Saving..." : "Save Option"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
