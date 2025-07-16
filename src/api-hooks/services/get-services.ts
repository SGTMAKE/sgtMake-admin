import { useQuery } from "@tanstack/react-query"
import { ServiceResProps } from "@/lib/types/service-types"

export const useServices = () => {
  return useQuery<ServiceResProps>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch services")
      }
      
      return response.json()
    },
    // Reduce cache time and enable background refetching
    staleTime: 0, // Data is immediately stale
    gcTime: 0, // Don't keep in cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}