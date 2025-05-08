"use client"

import axios from "@/config/axios.config"
import { useQuery } from "@tanstack/react-query"

interface ServiceStats {
  totalCount: number
  typeCounts: Record<string, number>
  todayCount: number
  lastWeekCount: number
}

interface ServiceStatsResponse {
  success: boolean
  stats: ServiceStats
}

async function fetchServiceStats() {
  const { data } = await axios.get("/api/services/stats")
  return data as ServiceStatsResponse
}

export function useServiceStats() {
  return useQuery({
    queryKey: ["serviceStats"],
    queryFn: fetchServiceStats,
  })
}
