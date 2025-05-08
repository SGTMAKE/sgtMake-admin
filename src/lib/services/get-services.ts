import axios from "@/config/axios.config"
import { headers } from "next/headers"
import type { ServiceResProps } from "../types/service-types"

export async function getServicesServer() {
  const headerSequence = headers()
  const cookie = headerSequence.get("cookie")
  const { data } = await axios.get("/api/services", {
    headers: {
      Cookie: `${cookie}`,
    },
  })

  return data as ServiceResProps
}
