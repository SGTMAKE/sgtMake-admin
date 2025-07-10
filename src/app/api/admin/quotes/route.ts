import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {db} from "@/lib/prisma"
import { error401 } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
          return error401("Unauthorized");
    }

    const quoteRequests = await db.quoteRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      quoteRequests,
    })
  } catch (error) {
    console.error("Error fetching quote requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
