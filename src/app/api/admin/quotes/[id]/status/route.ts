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

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    const quoteId = params.id

    // Update quote status
    const updatedQuote = await db.quoteRequest.update({
      where: { id: quoteId },
      data: {
        status,
        responseReceived: status === "ACCEPTED" || status === "REJECTED",
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

    if (!updatedQuote) {
      return NextResponse.json({ success: false, error: "Quote not found" }, { status: 404 })
    }

    // Send status update email to customer
    try {
      const statusMessages = {
        ACCEPTED: "Your quote has been accepted! We'll process your order soon.",
        REJECTED: "Unfortunately, this quote has been declined. Please contact us for alternatives.",
        PENDING: "Your quote is under review by our team.",
        QUOTED: "Your quote is ready for review.",
      }

      await emailService.sendQuoteStatusUpdate({
        quoteRequestId: updatedQuote.id,
        customerName: updatedQuote.user.name || "Customer",
        customerEmail: updatedQuote.user.email,
        newStatus: status,
        quotedPrice: updatedQuote.quotedPrice || undefined,
        adminResponse: updatedQuote.adminResponse || undefined,
        items: updatedQuote.items as any[],
        totalItems: updatedQuote.totalItems,
      })
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Quote status updated successfully",
      quote: updatedQuote,
    })
  } catch (error) {
    console.error("Update quote status error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
