import Tabs from "@/components/dashboard/services/tabs"
import ServicesPage from "@/components/dashboard/services/services-page"
import Nav from "@/components/nav/nav"
import Hydrate from "@/lib/query-utils/hydrate-client";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { getServicesServer } from "@/lib/api/services/get-services";
export default async function ServicesPageContainer() {
   const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["services"],
    queryFn: getServicesServer,
  });
  
  const dehydratedState = dehydrate(queryClient);
  return (
      <Nav>
     <div className="container mx-auto px-4 py-8">
      <Hydrate state={dehydratedState}>
        <ServicesPage />
      </Hydrate>
    </div>
      </Nav>
  )
}
