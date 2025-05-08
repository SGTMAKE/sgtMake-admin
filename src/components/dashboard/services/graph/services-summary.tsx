import { Card, CardBody } from "@nextui-org/react"
import ServicesSummaryGraph from "./services-summary-graph"

const ServicesSummary = () => {
  return (
    <Card className="shadow-md">
      <CardBody>
        <h1 className="mx-2 mt-2 text-lg font-medium">Services by type</h1>
        <div className="h-[300px]">
          <ServicesSummaryGraph />
        </div>
      </CardBody>
    </Card>
  )
}

export default ServicesSummary
