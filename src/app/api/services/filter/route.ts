import { NextResponse } from "next/server"
import {db} from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Check authentication (uncomment if you have auth implemented)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Get the URL and parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build the query filter
    const filter: any = {}

    // Add type filter if provided
    if (type) {
      filter.formDetails = {
        path: ["type"],
        equals: type,
      }
    }

    // Add userId filter if provided
    if (userId) {
      filter.userId = userId
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {}

      if (startDate) {
        filter.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        filter.createdAt.lte = new Date(endDate)
      }
    }

    // Fetch filtered services from the database
    const services = await db.service.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error("Error filtering services:", error)
    return NextResponse.json({ success: false, message: "Failed to filter services" }, { status: 500 })
  }
}
