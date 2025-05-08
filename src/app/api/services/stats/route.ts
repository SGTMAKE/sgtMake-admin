import { NextResponse } from "next/server"
import {db} from "@/lib/prisma"

export async function GET() {
  try {
    // Check authentication (uncomment if you have auth implemented)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Get total count of services
    const totalCount = await db.service.count()

    // Get count by service type
    const services = await db.service.findMany({
      select: {
        formDetails: true,
      },
    })

    // Initialize counters
    const typeCounts: Record<string, number> = {
      batteryPack: 0,
      wiringHarness: 0,
      "cnc-machining": 0,
      "laser-cutting": 0,
      designing: 0,
      other: 0,
    }

    // Count services by type
    services.forEach((service) => {
      const formDetails = service.formDetails as { type: string } | null
      const type = formDetails?.type || 'other'
      typeCounts[type]++
    })

    // Get today's services count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayCount = await db.service.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Get services created in the last 7 days
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const lastWeekCount = await db.service.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalCount,
        typeCounts,
        todayCount,
        lastWeekCount,
      },
    })
  } catch (error) {
    console.error("Error fetching service statistics:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch service statistics" }, { status: 500 })
  }
}
