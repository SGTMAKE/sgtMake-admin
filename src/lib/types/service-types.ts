export interface ServiceProps {
    id: string
    userId: string
    fileName: string
    fileUrl: string
    fileType: string
    filePublicId: string
    formDetails: {
      type: string
      [key: string]: any
    }
    createdAt: string
    updatedAt: string
    user?: {
      id: string
      name: string | null
      email: string | null
      image: string | null
      phone?: string | null
    }
  }
  
  export interface ServiceResProps {
    success: boolean
    services: ServiceProps[]
  }
  
  export interface SingleServiceResProps {
    success: boolean
    service: ServiceProps
  }
  