"use client"

import axios from "@/config/axios.config"
import type { SingleServiceResProps } from "@/lib/types/service-types"
import { useQuery } from "@tanstack/react-query"

async function fetchService(id: string) {
  const { data } = await axios.get(`/api/services/${id}`)
  return data as SingleServiceResProps
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => fetchService(id),
    enabled: !!id,
  })
}
