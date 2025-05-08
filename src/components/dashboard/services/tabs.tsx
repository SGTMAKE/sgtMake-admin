"use client"

import type React from "react"

import { Tabs as NextUITabs, Tab } from "@nextui-org/react"
import { BarChart3, Box } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Analytics from "./analytics"

const Tabs = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const [selected, setSelected] = useState(tab || "services")

  useEffect(() => {
    setSelected(tab || "services")
  }, [tab])

  return (
    <NextUITabs
      variant="underlined"
      aria-label="Services"
      color="primary"
      className="max-w-full overflow-x-scroll md:overflow-hidden"
      selectedKey={selected}
    >
      <Tab
        key="services"
        as={Link}
        href={`/dashboard/services`}
        title={
          <div className="flex items-center gap-2">
            <Box size={20} />
            <span>Services</span>
          </div>
        }
      >
        {children}
      </Tab>
      <Tab
        key="analytics"
        href={`/dashboard/services?tab=analytics`}
        as={Link}
        title={
          <div className="flex items-center gap-2">
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>
        }
      >
        <Analytics />
      </Tab>
    </NextUITabs>
  )
}

export default Tabs
