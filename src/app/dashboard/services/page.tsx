import Tabs from "@/components/dashboard/services/tabs"
import ServicesPage from "@/components/dashboard/services/services-page"
import Nav from "@/components/nav/nav"
import { getServicesServer } from "@/lib/api/services/get-services"

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic"
export const revalidate = 0


export default async function ServicesPageContainer() {
  // Fetch services data on the server
  const servicesData = await getServicesServer()
  const services = servicesData || []
  return (
    <Nav>
      <div className="container mx-auto px-4 py-8">
        <Tabs>
          <ServicesPage services={services} />
        </Tabs>
      </div>
    </Nav>
  )
}
