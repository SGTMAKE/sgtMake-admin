import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { emailService } from "@/lib/email/email-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { quotedPrice, adminResponse, status } = body

    if (!quotedPrice || !adminResponse || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const quoteId = params.id

    // Update the quote request
    const updatedQuote = await db.quoteRequest.update({
      where: { id: quoteId },
      data: {
        quotedPrice: Number.parseFloat(quotedPrice),
        adminResponse,
        status,
        updatedAt: new Date(),
      },
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

    // Send quote response email to customer
    try {
      await emailService.sendQuoteResponse({
        quoteRequestId: updatedQuote.id,
        customerName: updatedQuote.user.name || "Valued Customer",
        customerEmail: updatedQuote.user.email,
        quotedPrice: updatedQuote.quotedPrice || 0,
        adminResponse: updatedQuote.adminResponse || "",
        items: updatedQuote.items as any[],
        totalItems: updatedQuote.totalItems,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      })

      // Update email sent status
      await db.quoteRequest.update({
        where: { id: quoteId },
        data: { emailSent: true },
      })

      console.log("Quote response email sent successfully")
    } catch (emailError) {
      console.error("Failed to send quote response email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Quote response sent successfully",
    })
  } catch (error) {
    console.error("Quote response error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
