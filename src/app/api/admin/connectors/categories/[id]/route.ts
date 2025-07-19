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
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let category
    if (type === "wires") {
      category = await db.wireCategory.findUnique({
        where: { id: params.id },
        include: {
          options: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    } else {
      category = await db.connectorCategory.findUnique({
        where: { id: params.id },
        include: {
          options: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    }

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error("Error fetching connector/wire category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "true"
    const type = formData.get("type") as string
    const imageFile = formData.get("image") as File | null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let existingCategory
    if (type === "wires") {
      existingCategory = await db.wireCategory.findUnique({
        where: { id: params.id },
      })
    } else {
      existingCategory = await db.connectorCategory.findUnique({
        where: { id: params.id },
      })
    }

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

        const dataUri = `data:${imageFile.type};base64,${buffer.toString("base64")}`

        const uploadResult = await cloudinary.uploader.upload(dataUri,  {
                resource_type: "image",
                folder: type === "wires" ? "wire-categories" : "connector-categories",
              },)

        

        imagePublicId = uploadResult.public_id
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    let category
    if (type === "wires") {
      category = await db.wireCategory.update({
        where: { id: params.id },
        data: {
          name,
          description,
          image: imagePublicId,
          isActive,
        },
      })
    } else {
      category = await db.connectorCategory.update({
        where: { id: params.id },
        data: {
          name,
          description,
          image: imagePublicId,
          isActive,
        },
      })
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error("Error updating connector/wire category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let category
    if (type === "wires") {
      category = await db.wireCategory.findUnique({
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

      await db.wireOption.deleteMany({
        where: { categoryId: params.id },
      })
      await db.wireCategory.delete({
        where: { id: params.id },
      })
    } else {
      category = await db.connectorCategory.findUnique({
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

      await db.connectorOption.deleteMany({
        where: { categoryId: params.id },
      })
      await db.connectorCategory.delete({
        where: { id: params.id },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting connector/wire category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
