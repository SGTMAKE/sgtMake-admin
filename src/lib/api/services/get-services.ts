import { ServiceResProps } from '@/lib/types/service-types';
import axios from "@/config/axios.config";
import { headers } from "next/headers";
export async function getServicesServer() {
  const headerSequence = headers();
  const cookie = headerSequence.get("cookie");
  const { data } = await axios.get("/api/services", {
    headers: {
      Cookie: `${cookie}`,
    },
  });

  return data as ServiceResProps;
}