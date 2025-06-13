"use client"
import Nav from "@/components/nav/nav"
import ServiceDetailClient from "@/components/dashboard/services/service-detail"

interface ServiceDetailPageProps {
  params: { id: string }
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  return (
    <Nav>
      <ServiceDetailClient id={params.id} />
    </Nav>
  )
}
