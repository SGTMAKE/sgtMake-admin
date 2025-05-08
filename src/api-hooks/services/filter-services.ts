"use client"

import axios from "@/config/axios.config"
import type { ServiceResProps } from "@/lib/types/service-types"
import { useQuery } from "@tanstack/react-query"

interface FilterParams {
  type?: string
  userId?: string
  startDate?: string
  endDate?: string
}

async function filterServices(params: FilterParams) {
  const queryParams = new URLSearchParams()

  if (params.type) queryParams.append("type", params.type)
  if (params.userId) queryParams.append("userId", params.userId)
  if (params.startDate) queryParams.append("startDate", params.startDate)
  if (params.endDate) queryParams.append("endDate", params.endDate)

  const { data } = await axios.get(`/api/services/filter?${queryParams.toString()}`)
  return data as ServiceResProps
}

export function useFilterServices(params: FilterParams) {
  return useQuery({
    queryKey: ["filteredServices", params],
    queryFn: () => filterServices(params),
    enabled: Object.values(params).some((value) => !!value), // Only run if at least one filter is provided
  })
}
