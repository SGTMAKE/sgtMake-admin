import { type NextRequest, NextResponse } from "next/server"

import { cloudinary } from "@/config/cloudinary.config"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const quality = (formData.get("quality") as string) || "auto"
    const width = formData.get("width") as string
    const height = formData.get("height") as string
    const type = (formData.get("type") as string) || "connectors" // or wires

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer and then to data URI
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`

    // Prepare Cloudinary upload options
    const uploadOptions: any = {
      resource_type: "image",
      quality: quality,
      format: "webp",
      folder:"sgtmake/categories",
    }
    if (width) uploadOptions.width = Number.parseInt(width)
    if (height) uploadOptions.height = Number.parseInt(height)
    if (width || height) uploadOptions.crop = "fill"

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions)

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  } catch (error) {
    console.log("Upload error:", error)
    return NextResponse.json({ error: "Upload failed", rr: error }, { status: 500 })
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
