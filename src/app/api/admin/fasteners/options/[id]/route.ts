import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {db} from "@/lib/prisma"
import { cloudinary } from "@/config/cloudinary.config"
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { name, label, type, required, helpText, values } = body

    if (!name || !label) {
      return NextResponse.json({ error: "Name and label are required" }, { status: 400 })
    }

    const option = await db.fastenerOption.update({
      where: { id: params.id },
      data: {
        name,
        label,
        type,
        required,
        helpText,
        values,
      },
    })

    return NextResponse.json({
      success: true,
      option,
    })
  } catch (error) {
    console.error("Error updating fastener option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Get option to delete associated images
    const option = await db.fastenerOption.findUnique({
      where: { id: params.id },
    })

    if (option?.values) {
      // Delete images from Cloudinary for option values that have images
      for (const value of option.values as any[]) {
        if (value.image && value.publicId) {
          try {
            await cloudinary.uploader.destroy(value.publicId)
          } catch (error) {
            console.error("Error deleting image:", error)
          }
        }
      }
    }

    await db.fastenerOption.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Option deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting fastener option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
