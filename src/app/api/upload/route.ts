import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cloudinary } from "@/config/cloudinary.config"



export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const quality = (formData.get("quality") as string) || "auto"
    const width = formData.get("width") as string
    const height = formData.get("height") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with optimization
    const uploadOptions: any = {
      resource_type: "image",
      quality: quality,
      format: "webp", // Convert to WebP for better compression
      folder: "sgtmake/categories",
    }

    // Add dimensions if provided (for option images)
    if (width) uploadOptions.width = Number.parseInt(width)
    if (height) uploadOptions.height = Number.parseInt(height)
    if (width || height) uploadOptions.crop = "fill"

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get("publicId")

    if (!publicId) {
      return NextResponse.json({ error: "Public ID required" }, { status: 400 })
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
