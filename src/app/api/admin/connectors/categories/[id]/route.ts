import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {db} from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

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
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { name, description, image, isActive, type } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let category
    if (type === "wires") {
      category = await db.wireCategory.update({
        where: { id: params.id },
        data: {
          name,
          description,
          image,
          isActive,
        },
      })
    } else {
      category = await db.connectorCategory.update({
        where: { id: params.id },
        data: {
          name,
          description,
          image,
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
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "wires") {
      await db.wireOption.deleteMany({
        where: { categoryId: params.id },
      })
      await db.wireCategory.delete({
        where: { id: params.id },
      })
    } else {
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
