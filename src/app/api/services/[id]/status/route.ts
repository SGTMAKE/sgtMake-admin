import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { sendServiceStatusEmail } from "@/lib/email/send-status-email"
import type { ServiceStatus } from "@/lib/types/service-types"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { status }: { status: ServiceStatus } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses: ServiceStatus[] = ["pending" , "approved" ,"testing" , "production" , "cancelled" , "cancel_requested" , "shipped" , "delivered"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    // Get the service with user information
    const service = await db.service.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ success: false, message: "Service not found" }, { status: 404 })
    }

    // Update the service status
    const updatedService = await db.service.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    })

    // Send email notification (don't block the response if email fails)
    if (updatedService.user?.email) {
      sendServiceStatusEmail(updatedService as any, status).catch((error) => {
        console.log("Failed to send status email:", error)
      })
    }

    return NextResponse.json({
      success: true,
      message: "Service status updated successfully",
      service: updatedService,
    })
  } catch (error) {
    console.error("Error updating service status:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
