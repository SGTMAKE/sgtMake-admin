import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

export async function GET() {
  try {
    // const session = await getServerSession(authOptions)

    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const [totalProducts, pendingQuotes, pendingServices, totalOrders, recentQuotes, recentServices] =
      await Promise.all([
        db.product.count(),
        db.quoteRequest.count({ where: { status: "pending" } }),
        db.service.count({ where: { status: "pending" } }),
        db.order.count(),
        db.quoteRequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        }),
        db.service.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        }),
      ])

    return NextResponse.json({
      totalProducts,
      pendingQuotes,
      pendingServices,
      totalOrders,
      recentQuotes: recentQuotes.map((quote) => ({
        id: quote.id,
        customerName: quote.user.name,
        totalItems: quote.totalItems,
        status: quote.status,
        createdAt: quote.createdAt,
      })),
      recentServices: recentServices.map((service) => ({
        id: service.id,
        customerName: service.user.name,
        serviceType: service.type || "Unknown",
        status: service.status,
        createdAt: service.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
