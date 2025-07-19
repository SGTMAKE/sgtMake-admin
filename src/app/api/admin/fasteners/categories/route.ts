import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    const categories = await db.fastenerCategory.findMany({
      include: {
        options: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error("Error fetching fastener categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "true"
    const imageFile = formData.get("image") as File | null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let imagePublicId = ""

    // Upload image to Cloudinary if provided
    if (imageFile) {
      try {
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

    const category = await db.fastenerCategory.create({
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
    console.error("Error creating fastener category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
