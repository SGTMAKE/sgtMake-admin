import axios from "@/config/axios.config"
import { headers } from "next/headers"
import type { SingleServiceResProps } from "../types/service-types"

export async function getServiceServer(sid: string) {
  const headerSequence = headers()
  const cookie = headerSequence.get("cookie")
  const { data } = await axios.get(`/api/services/${sid}`, {
    headers: {
      Cookie: `${cookie}`,
    },
  })

  return data as SingleServiceResProps
}
