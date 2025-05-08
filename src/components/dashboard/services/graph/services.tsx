"use client"

import { Button, Card, CardBody } from "@nextui-org/react"
import ServicesGraph from "./services-graph"
import { type Dispatch, type SetStateAction, useState } from "react"

// Sample data for the graph
const sampleData = {
  weeklyData: [
    { name: "Mon", uv: 4 },
    { name: "Tue", uv: 3 },
    { name: "Wed", uv: 5 },
    { name: "Thu", uv: 2 },
    { name: "Fri", uv: 6 },
    { name: "Sat", uv: 8 },
    { name: "Sun", uv: 4 },
  ],
  monthlyData: [
    { name: "Week 1", uv: 15 },
    { name: "Week 2", uv: 20 },
    { name: "Week 3", uv: 18 },
    { name: "Week 4", uv: 25 },
  ],
  yearlyData: [
    { name: "Jan", uv: 40 },
    { name: "Feb", uv: 35 },
    { name: "Mar", uv: 50 },
    { name: "Apr", uv: 45 },
    { name: "May", uv: 60 },
    { name: "Jun", uv: 55 },
    { name: "Jul", uv: 70 },
    { name: "Aug", uv: 65 },
    { name: "Sep", uv: 80 },
    { name: "Oct", uv: 75 },
    { name: "Nov", uv: 90 },
    { name: "Dec", uv: 85 },
  ],
}

type FilterButtonProps = {
  children: string
  data: any[]
  filter: string
  activeFilter: string
  setGraphData: Dispatch<SetStateAction<any[]>>
  setActiveFilter: Dispatch<SetStateAction<string>>
}

const Services = () => {
  const [graphData, setGraphData] = useState(sampleData.yearlyData)
  const [activeFilter, setActiveFilter] = useState("year")

  return (
    <Card className="col-span-2 shadow-md">
      <CardBody>
        <div className="mb-10 grid grid-cols-1 items-center space-y-2 @sm:grid-cols-2">
          <h1 className="mx-2 mt-2 text-lg font-medium">Services details</h1>
          <div className="@sm:justify-self-end">
            <FilterButton
              data={sampleData.weeklyData}
              filter="week"
              activeFilter={activeFilter}
              setGraphData={setGraphData}
              setActiveFilter={setActiveFilter}
            >
              Week
            </FilterButton>
            <FilterButton
              data={sampleData.monthlyData}
              filter="month"
              activeFilter={activeFilter}
              setGraphData={setGraphData}
              setActiveFilter={setActiveFilter}
            >
              Month
            </FilterButton>
            <FilterButton
              data={sampleData.yearlyData}
              filter="year"
              activeFilter={activeFilter}
              setGraphData={setGraphData}
              setActiveFilter={setActiveFilter}
            >
              Year
            </FilterButton>
          </div>
        </div>
        <ServicesGraph data={graphData} />
      </CardBody>
    </Card>
  )
}

export default Services

const FilterButton = ({ children, data, filter, activeFilter, setGraphData, setActiveFilter }: FilterButtonProps) => (
  <Button
    size="sm"
    onClick={() => {
      setGraphData(data)
      setActiveFilter(filter)
    }}
    className={`
      ${
        activeFilter === filter
          ? "bg-indigo-100 text-primary dark:bg-zinc-800 dark:text-white"
          : "bg-transparent text-black dark:text-white"
      }
      hover:bg-indigo-100 hover:text-primary hover:dark:bg-zinc-800
    `}
  >
    {children}
  </Button>
)
