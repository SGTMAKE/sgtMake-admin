import { Card, CardBody } from "@nextui-org/react";
import { CreditCard } from "lucide-react";

type PaymentDetailsProps = {
  id: string;
  rzr_order_id: string | null;
  rzr_payment_id: string | null;
  orderId: string;
  amount: number;
  method: string;
  via: string;
  
};
export function formatCurrencyWithLocale(amount: number, currency: string, locale = "en-US") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

const PaymentDetails = ({ data ,currency="INR" }: { data: PaymentDetailsProps,currency?: string }) => {
  return (
    <Card className="mt-5 rounded-sm shadow-sm">
      <CardBody className="p-0">
        <div className="flex items-center gap-3 p-3">
          <CreditCard className="text-zinc-400" size={20} />
          <h1>Payment Details</h1>
        </div>
        <hr />
        <div className="p-3">
          <ul className="my-2 space-y-1 text-sm">
            <li className="text-[#878a99]">
              Transactions:{" "}
              <span className="font-medium text-black dark:text-white">
                #{data.id}
              </span>
            </li>
            <li className="text-[#878a99]">
              Rzr_Order_Id:{" "}
              <span className="font-medium text-black dark:text-white">
                {data.rzr_order_id ? data.rzr_order_id : "******"}
              </span>
            </li>
            <li className="text-[#878a99]">
              Rzr_Payment_Id:{" "}
              <span className="font-medium text-black dark:text-white">
                {data.rzr_payment_id ? data.rzr_payment_id : "******"}
              </span>
            </li>
            <li className="text-[#878a99]">
              Payment Method:{" "}
              <span className="font-medium text-black dark:text-white">
                {data.method}
              </span>
            </li>
            <li className="text-[#878a99]">
              Via:{" "}
              <span className="font-medium text-black dark:text-white">
                {data.via}
              </span>
            </li>
            <li className="text-[#878a99]">
              Total Amount:{" "}
              <span className="font-medium text-black dark:text-white">
                {formatCurrencyWithLocale(data.amount,currency)}
              </span>
            </li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentDetails;
