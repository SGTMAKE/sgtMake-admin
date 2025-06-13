import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import type { ServiceStatus } from "@/lib/types/service-types"

interface UpdateServiceStatusParams {
  id: string
  status: ServiceStatus
}

export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateServiceStatusParams) => {
      const response = await axios.patch(`/api/services/${id}/status`, { status })
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["service", variables.id] })
    },
  })
}
