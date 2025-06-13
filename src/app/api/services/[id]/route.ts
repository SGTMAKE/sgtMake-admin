import { NextResponse } from "next/server"
import {db} from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate ObjectId format for MongoDB
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid service ID format" }, { status: 400 })
    }

    // Check authentication (uncomment if you have auth implemented)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the service by ID
    const service = await db.service.findUnique({
      where: {
        id,
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
        }
      },
    })

    if (!service) {
      return NextResponse.json({ success: false, message: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      service,
    })
  } catch (error) {
    console.log("Error fetching service:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch service" }, { status: 500 })
  }
}
