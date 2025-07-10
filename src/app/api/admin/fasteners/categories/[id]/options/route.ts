import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const options = await db.fastenerOption.findMany({
      where: { categoryId: params.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      success: true,
      options,
    })
  } catch (error) {
    console.error("Error fetching fastener options:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const option = await db.fastenerOption.create({
      data: {
        categoryId: params.id,
        name,
        label,
        type,
        required: required || false,
        helpText,
        values: values || [],
      },
    })

    return NextResponse.json({
      success: true,
      option,
    })
  } catch (error) {
    console.error("Error creating fastener option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
