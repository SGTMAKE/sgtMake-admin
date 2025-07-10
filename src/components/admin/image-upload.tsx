"use client"

import type React from "react"

import { useState, useRef, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string, publicId?: string) => void
  label?: string
  size?: "small" | "medium" | "large"
  quality?: "low" | "medium" | "high"
  deferred?: boolean
  disabled?: boolean
}

export interface ImageUploadRef {
  uploadPendingFile: () => Promise<void>
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(
  (
    { value, onChange, label = "Image", size = "medium", quality = "medium", deferred = false, disabled = false },
    ref,
  ) => {
    const [isUploading, setIsUploading] = useState(false)
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [manualUrl, setManualUrl] = useState("")
    const [activeTab, setActiveTab] = useState("upload")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Size configurations
    const sizeConfig = {
      small: { width: 100, height: 100, className: "w-24 h-24" },
      medium: { width: 300, height: 200, className: "w-full h-48" },
      large: { width: 800, height: 600, className: "w-full h-64" },
    }

    // Quality configurations
    const qualityConfig = {
      low: 30,
      medium: 60,
      high: 90,
    }

    useImperativeHandle(ref, () => ({
      uploadPendingFile: async () => {
        if (pendingFile && deferred) {
          await handleFileUpload(pendingFile)
        }
      },
    }))

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      if (deferred) {
        // Store file for later upload and show preview
        setPendingFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          setPreviewUrl(url)
          onChange(url) // Pass preview URL for immediate display
        }
        reader.readAsDataURL(file)
      } else {
        // Upload immediately
        handleFileUpload(file)
      }
    }

    const handleFileUpload = async (file: File) => {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("width", sizeConfig[size].width.toString())
        formData.append("height", sizeConfig[size].height.toString())
        formData.append("quality", qualityConfig[quality].toString())

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        onChange(data.url, data.publicId)
        setPendingFile(null)
        setPreviewUrl("")
        toast.success("Image uploaded successfully")
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload image")
        throw error // Re-throw to handle in parent component
      } finally {
        setIsUploading(false)
      }
    }

    const handleManualUrlSubmit = () => {
      if (!manualUrl.trim()) {
        toast.error("Please enter a valid URL")
        return
      }

      // Basic URL validation
      try {
        new URL(manualUrl)
        onChange(manualUrl)
        setManualUrl("")
        toast.success("Image URL added successfully")
      } catch {
        toast.error("Please enter a valid URL")
      }
    }

    const handleRemoveImage = () => {
      onChange("")
      setPendingFile(null)
      setPreviewUrl("")
      setManualUrl("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    const displayUrl = value || previewUrl
    const isComponentDisabled = disabled || isUploading

    return (
      <div className="space-y-4 relative">
        <Label className="text-sm  font-medium">{label}</Label>

        {displayUrl && (
          <div className=" inline-block">
            
            <Button
              type="button"
              className="absolute -top-2 -right-2  rounded-full p-0 bg-orange-500 "
              onClick={handleRemoveImage}
              disabled={isComponentDisabled}
            >
              Remove 
            </Button>
            
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2" disabled={isComponentDisabled}>
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2" disabled={isComponentDisabled}>
              <Link className="h-4 w-4" />
              Manual URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isComponentDisabled}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Choose Image"}
              </Button>
              <span className="text-sm text-gray-500">
                Max 5MB • {sizeConfig[size].width}x{sizeConfig[size].height}px • {quality} quality
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isComponentDisabled}
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="flex-1"
                disabled={isComponentDisabled}
              />
              <Button
                type="button"
                onClick={handleManualUrlSubmit}
                disabled={!manualUrl.trim() || isComponentDisabled}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Add URL
              </Button>
            </div>
            <p className="text-xs text-gray-500">Enter a direct link to an image file (jpg, png, gif, webp)</p>
          </TabsContent>
        </Tabs>
      </div>
    )
  },
)

ImageUpload.displayName = "ImageUpload"
