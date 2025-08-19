"use client"
import { useGlobalContext } from "@/context/store"
import type { ImagePreviewProps } from "@/lib/types/types"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

const ImagePreview = ({ image, variantIndex, imageIndex, action }: ImagePreviewProps) => {
  const { setColorVariants } = useGlobalContext()
  const pathname = usePathname()

  function handleDeleteThumbnail(variantIndex: number) {
    setColorVariants((prevVariants) =>
      prevVariants.map((value, i) => (i === variantIndex ? { ...value, thumbnail: "" } : value)),
    )
  }

  function handleDeleteOthers(variantIndex: number, imageIndex: number) {
    setColorVariants((prevVariant) =>
      prevVariant.map((value, i) => ({
        ...value,
        others: i === variantIndex ? value.others.filter((_, index) => index !== imageIndex) : [...value.others],
      })),
    )
  }

  // Determine image source - if it's a public_id, construct Cloudinary URL
  const getImageSrc = (imageData: string) => {
    if (imageData.startsWith("data:")) {
      return imageData // Data URI
    } else if (imageData.startsWith("http")) {
      return imageData // Full URL
    } else {
      // Assume it's a Cloudinary public_id
      return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${imageData}`
    }
  }

  return (
    <div className="relative h-full w-20 flex-shrink-0 md:w-16 lg:w-20">
      <Image
        fill
        priority
        className="bg-gray-200 rounded object-cover"
        src={getImageSrc(image) || "/placeholder.svg"}
        alt="Product image"
        sizes="200px"
      />
      {!pathname.endsWith("edit") && (
        <button
          type="button"
          className="absolute -right-2 -top-2 z-50 rounded-full bg-red-500 p-1 hover:bg-red-600 transition-colors"
          onClick={() => {
            action === "thumbnail"
              ? handleDeleteThumbnail(variantIndex)
              : handleDeleteOthers(variantIndex, imageIndex ?? 0)
          }}
        >
          <Trash2 className="text-white" size={12} />
        </button>
      )}
    </div>
  )
}

export default ImagePreview
