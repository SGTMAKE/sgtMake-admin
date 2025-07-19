"use client"

import SummaryCard from "@/components/dashboard/summary/summary-card"
import type { ServiceProps } from "@/lib/types/service-types"
import { Boxes, CalendarClock, Wrench, Zap } from "lucide-react"
import ServicesTable from "./services-table"

interface ServicesPageProps {
  services: ServiceProps[]
}

const ServicesPage = ({ services }: ServicesPageProps) => {
  function countServicesByType(services: ServiceProps[], type?: string) {
    if (!services) return 0
    if (!type) return services.length

    return services.filter((service) => service.type.toLowerCase().includes(type.toLowerCase())).length
  }

  function findTodaysServices(services: ServiceProps[]) {
    if (!services) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return services.filter((service) => {
      const inputDate = new Date(service.createdAt)
      inputDate.setHours(0, 0, 0, 0)
      return today.getTime() === inputDate.getTime()
    }).length
  }

  return (
    <>
      <div className="mb-10 @container">
        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-4">
          <SummaryCard
            bgcolor="bg-primary"
            color="text-primary"
            icon={Wrench}
            title="Battery Packs"
            value={countServicesByType(services, "batteryPack")}
          />
          <SummaryCard
            bgcolor="bg-warning"
            color="text-warning"
            icon={Zap}
            title="Wiring Harness"
            value={countServicesByType(services, "wiringHarness")}
          />
          <SummaryCard
            bgcolor="bg-success"
            color="text-success"
            icon={Boxes}
            title="CNC Machining"
            value={countServicesByType(services, "cnc")}
          />
          <SummaryCard
            bgcolor="bg-success"
            color="text-success"
            icon={Boxes}
            title="Laser Cutting"
            value={countServicesByType(services, "laser")}
          />
          <SummaryCard
            bgcolor="bg-success"
            color="text-success"
            icon={Boxes}
            title="3D Printing"
            value={countServicesByType(services, "designing")}
          />
          <SummaryCard
            bgcolor="bg-[#23B7E5]"
            color="text-[#23B7E5]"
            icon={CalendarClock}
            title="Today's Services"
            value={findTodaysServices(services)}
          />
        </div>
      </div>
      <ServicesTable services={services} />
    </>
  )
}

export default ServicesPage
