import Nav from "@/components/nav/nav";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "@/lib/query-utils/hydrate-client";
import { QueryClient } from "@tanstack/react-query";
import { getProductsServer } from "@/lib/api/products/get-products";
import ProductsTable from "@/components/products/products-table";

const Products = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: getProductsServer,
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <Nav>
        <Hydrate state={dehydratedState}>
          <ProductsTable />
        </Hydrate>
    </Nav>
  );
};

export default Products;
