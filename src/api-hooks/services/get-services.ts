"use client"

import axios from "@/config/axios.config"
import type { ServiceResProps } from "@/lib/types/service-types"
import { useQuery } from "@tanstack/react-query"

async function fetchServices() {
  const { data } = await axios.get("/api/services")
  return data as ServiceResProps
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  })
}