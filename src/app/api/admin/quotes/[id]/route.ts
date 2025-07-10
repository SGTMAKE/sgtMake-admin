import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin (you can implement your admin check logic here)
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // For now, assuming all authenticated users can access admin routes
    // You should implement proper admin role checking here

    const quoteId = params.id

    const quoteRequest = await db.quoteRequest.findUnique({
      where: { id: quoteId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!quoteRequest) {
      return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      quote: quoteRequest,
    })
  } catch (error) {
    console.error("Get quote details error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
