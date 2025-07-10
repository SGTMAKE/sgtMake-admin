import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {db} from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

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
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { name, description, image, isActive, type } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    let category
    if (type === "wires") {
      category = await db.wireCategory.create({
        data: {
          name,
          description,
          image,
          isActive: isActive ?? true,
        },
      })
    } else {
      category = await db.connectorCategory.create({
        data: {
          name,
          description,
          image,
          isActive: isActive ?? true,
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
