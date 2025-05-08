"use client"

import { useServices } from "@/api-hooks/services/get-services"
import SummaryCard from "@/components/dashboard/summary/summary-card"
import type { ServiceProps } from "@/lib/types/service-types"
import { Boxes, CalendarClock, Wrench, Zap } from "lucide-react"
import ServicesTable from "./services-table"

const ServicesPage = () => {
  const { data } = useServices()

  function countServicesByType(services?: ServiceProps[], type?: string) {
    if (!services) return 0
    if (!type) return services.length

    return services.filter((service) => service.formDetails.type.toLowerCase().includes(type.toLowerCase())).length
  }

  function findTodaysServices(services?: ServiceProps[]) {
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
            value={countServicesByType(data?.services, "batteryPack")}
          />
          <SummaryCard
            bgcolor="bg-warning"
            color="text-warning"
            icon={Zap}
            title="Wiring Harness"
            value={countServicesByType(data?.services, "wiringHarness")}
          />
          <SummaryCard
            bgcolor="bg-success"
            color="text-success"
            icon={Boxes}
            title="Manufacturing"
            value={
              countServicesByType(data?.services, "cnc") +
              countServicesByType(data?.services, "laser") +
              countServicesByType(data?.services, "designing")
            }
          />
          <SummaryCard
            bgcolor="bg-[#23B7E5]"
            color="text-[#23B7E5]"
            icon={CalendarClock}
            title="Today's Services"
            value={findTodaysServices(data?.services)}
          />
        </div>
      </div>
      <ServicesTable services={data?.services} />
    </>
  )
}

export default ServicesPage
