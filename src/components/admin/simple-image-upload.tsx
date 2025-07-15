"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface SimpleImageUploadProps {
  currentImageUrl?: string
  currentPublicId?: string
  onImageChange: (url: string, publicId?: string) => void
  onImageRemove?: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export default function SimpleImageUpload({
  currentImageUrl,
  currentPublicId,
  onImageChange,
  onImageRemove,
  label = "Upload Image",
  disabled = false,
  className = "",
}: SimpleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      setIsUploading(true)

      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()

        if (currentPublicId && currentPublicId !== data.publicId) {
          try {
            await fetch(`/api/upload?publicId=${encodeURIComponent(currentPublicId)}`, {
              method: "DELETE",
            })
          } catch (error) {
            console.error("Error deleting old image:", error)
          }
        }

        onImageChange(data.url, data.publicId)
        setPreviewUrl("")
        toast.success("Image uploaded successfully")
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload image")
        setPreviewUrl("")
      } finally {
        setIsUploading(false)
      }
    },
    [currentPublicId, onImageChange],
  )

  const handleRemoveImage = useCallback(async () => {
    if (currentPublicId) {
      try {
        await fetch(`/api/upload?publicId=${encodeURIComponent(currentPublicId)}`, {
          method: "DELETE",
        })
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }

    setPreviewUrl("")
    if (onImageRemove) {
      onImageRemove()
    }
  }, [currentPublicId, onImageRemove])

  const displayUrl = previewUrl || currentImageUrl
  const hasImage = !!displayUrl

  return (
    <div className={`space-y-4 ${className} mb-3`}>
      {/* <Label className="text-sm font-medium">{label}</Label> */}

      {hasImage && (
        <div className="relative inline-block mx-auto">
          <div className="relative w-full h-48 pl-6 border rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={displayUrl || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-cover "
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=200&width=300"
              }}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            className="absolute -top-2 -right-2 rounded-full h-7  "
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4 relative bottom-1" />
          </Button>

          {previewUrl && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading image...</span>
            </div>
          )}

          {currentImageUrl && !previewUrl && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <ImageIcon className="w-4 h-4" />
              <span>Image uploaded successfully</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isUploading ? "Uploading..." : hasImage ? "Replace Image" : "Choose Image"}
        </Button>
        <span className="text-sm text-gray-500">Max 5MB • JPG, PNG, GIF, WebP</span>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
