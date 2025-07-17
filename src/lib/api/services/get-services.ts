import type { ServiceResProps } from "@/lib/types/service-types"

export async function getServicesServer(): Promise<ServiceResProps> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001"
    const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`

    const response = await fetch(`${url}/api/services`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error("Error fetching services:", error)
    return {
      success: false,
      services: [],
    }
  }
}
