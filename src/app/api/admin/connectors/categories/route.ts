import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'connectors' or 'wires'

    let categories
    if (type === "wires") {
      categories = await db.wireCategory.findMany({
        include: {
          options: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      categories = await db.connectorCategory.findMany({
        include: {
          options: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error("Error fetching connector/wire categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "true"
    const type = formData.get("type") as string
    const imageFile = formData.get("image") as File | null

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    let imagePublicId = ""

    // Upload image to Cloudinary if provided
    if (imageFile) {
      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

     
        const dataUri = `data:${imageFile.type};base64,${buffer.toString("base64")}`

        const uploadResult = await cloudinary.uploader.upload(dataUri,  {
                resource_type: "image",
                folder: type === "wires" ? "wire-categories" : "connector-categories",
              })


        imagePublicId = uploadResult.public_id
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    let category
    if (type === "wires") {
      category = await db.wireCategory.create({
        data: {
          name,
          description,
          image: imagePublicId,
          isActive,
        },
      })
    } else {
      category = await db.connectorCategory.create({
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
    console.error("Error creating connector/wire category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
