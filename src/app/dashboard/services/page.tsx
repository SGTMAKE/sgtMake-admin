import { getServicesServer } from "@/lib/services/get-services"
import Tabs from "@/components/dashboard/services/tabs"
import ServicesPage from "@/components/dashboard/services/services-page"
import Nav from "@/components/nav/nav"

export default async function ServicesPageContainer() {
  await getServicesServer() // Prefetch data for hydration

  return (
      <Nav>
    <div className="container mx-auto px-4 py-8">
      <Tabs>
        <ServicesPage />
      </Tabs>
    </div>
      </Nav>
  )
}
