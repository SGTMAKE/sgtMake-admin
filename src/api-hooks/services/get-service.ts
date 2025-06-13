"use client"

import axios from "@/config/axios.config"
import type { SingleServiceResProps } from "@/lib/types/service-types"
import { useQuery } from "@tanstack/react-query"

async function fetchService(id: string): Promise<SingleServiceResProps> {
  try {
    const { data } = await axios.get(`/api/services/${id}`)
    return data
  } catch (error) {
    console.error("Error fetching service:", error)
    throw error
  }
}

export const useService = (id: string) => {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => fetchService(id),
    enabled: !!id,
    retry: 3,
    retryDelay: 1000,
  })
}

// Default export for compatibility
export default useService
