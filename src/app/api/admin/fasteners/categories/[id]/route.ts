import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await db.fastenerCategory.findUnique({
      where: { id: params.id },
      include: {
        options: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error("Error fetching fastener category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "true"
    const imageFile = formData.get("image") as File | null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Get existing category
    const existingCategory = await db.fastenerCategory.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    let imagePublicId = existingCategory.image

    // Upload new image if provided
    if (imageFile) {
      try {
        // Delete old image if exists
        if (existingCategory.image) {
          await cloudinary.uploader.destroy(existingCategory.image)
        }

        // Upload new image
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadResult = (await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "fastener-categories",
              },
              (error, result) => {
                if (error) reject(error)
                else resolve(result)
              },
            )
            .end(buffer)
        })) as any

        imagePublicId = uploadResult.public_id
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    const category = await db.fastenerCategory.update({
      where: { id: params.id },
      data: {
        name,
        description,
        image: imagePublicId,
        isActive,
      },
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error("Error updating fastener category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get category to delete associated image
    const category = await db.fastenerCategory.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Delete image from Cloudinary if exists
    if (category.image) {
      try {
        await cloudinary.uploader.destroy(category.image)
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }

    // Delete all options first
    await db.fastenerOption.deleteMany({
      where: { categoryId: params.id },
    })

    // Delete the category
    await db.fastenerCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting fastener category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
