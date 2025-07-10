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

    let options
    if (type === "wires") {
      options = await db.wireOption.findMany({
        where: { categoryId: params.id },
        orderBy: { createdAt: "asc" },
      })
    } else {
      options = await db.connectorOption.findMany({
        where: { categoryId: params.id },
        orderBy: { createdAt: "asc" },
      })
    }

    return NextResponse.json({
      success: true,
      options,
    })
  } catch (error) {
    console.error("Error fetching connector/wire options:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const body = await request.json()
    const { name, label, type: inputType, required, helpText, values } = body

    if (!name || !label) {
      return NextResponse.json({ error: "Name and label are required" }, { status: 400 })
    }

    let option
    if (type === "wires") {
      option = await db.wireOption.create({
        data: {
          categoryId: params.id,
          name,
          label,
          type: inputType,
          required: required || false,
          helpText,
          values: values || [],
        },
      })
    } else {
      option = await db.connectorOption.create({
        data: {
          categoryId: params.id,
          name,
          label,
          type: inputType,
          required: required || false,
          helpText,
          values: values || [],
        },
      })
    }

    return NextResponse.json({
      success: true,
      option,
    })
  } catch (error) {
    console.error("Error creating connector/wire option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
