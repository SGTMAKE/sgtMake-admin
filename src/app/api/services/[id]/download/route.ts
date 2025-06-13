import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { cloudinary } from "@/config/cloudinary.config"
import { authOptions } from "@/lib/auth"

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate ObjectId format for MongoDB
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid service ID format" }, { status: 400 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Fetch the service by ID
    const service = await db.service.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        filePublicId: true,
        fileType: true,
        fileUrl: true,
        userId: true,
      },
    })

    if (!service) {
      return NextResponse.json({ success: false, message: "Service not found" }, { status: 404 })
    }

    if (!service.filePublicId || !service.fileUrl) {
      return NextResponse.json({ success: false, message: "No file available for download" }, { status: 404 })
    }

    // Generate download URL from Cloudinary
    const isRaw = /\.(pdf|docx?|xlsx?|zip|csv|txt|rar|7z)$/i.test(service.filePublicId)

    const downloadUrl = cloudinary.url(service.filePublicId, {
      flags: "attachment",
      resource_type: isRaw ? "raw" : "image",
      secure: true,
    })

    // Log download activity (optional)
    console.log(`File download requested for service ${id} by user ${session.user?.email}`)

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileType: service.fileType,
      message: "Download URL generated successfully",
    })
  } catch (error) {
    console.error("Error generating download URL:", error)
    return NextResponse.json({ success: false, message: "Failed to generate download URL" }, { status: 500 })
  }
}
