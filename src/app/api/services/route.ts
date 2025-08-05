import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Check authentication (uncomment if you have auth implemented)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all services from the database
    const services = await db.service.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      {
        success: true,
        services,
      }
    )
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      {
        status: 500,
      },
    )
  }
}
