import { useMutation } from "@tanstack/react-query"
import axios from "@/config/axios.config"

interface DownloadResponse {
  success: boolean
  downloadUrl: string
  fileName: string
  fileType: string
  message: string
}

export const useDownloadServiceFile = () => {
  return useMutation({
    mutationFn: async (serviceId: string): Promise<DownloadResponse> => {
      const { data } = await axios.get(`/api/services/${serviceId}/download`)
      return data
    },
    onSuccess: (data) => {
      if (data.success && data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a")
        link.href = data.downloadUrl
        link.download = data.fileName
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    onError: (error) => {
      console.error("Download failed:", error)
    },
  })
}
