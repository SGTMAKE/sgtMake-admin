import Services from "./graph/services"
import ServicesSummary from "./graph/services-summary"

const Analytics = () => {
  return (
    <div className="@container">
      <div className="mt-5 grid grid-cols-1 @3xl:grid-cols-3 md:gap-3">
        <Services />
        <ServicesSummary />
      </div>
    </div>
  )
}

export default Analytics
