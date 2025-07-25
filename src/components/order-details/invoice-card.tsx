import { Button, Card, CardBody } from "@nextui-org/react";
import { Download } from "lucide-react";

const InvoiceCard = ({ oid ,orderID }: { oid: string ,orderID:string }) => {
  return (
    <Card className="rounded-sm shadow-sm">
      <CardBody className="flex-row items-center justify-between">
        <h1 className="font-semibold">Order #{orderID}</h1>
        {/* <Button
          startContent={<Download size={15} />}
          size="sm"
          color="success"
          className="text-white"
        >
          Invoice
        </Button> */}
      </CardBody>
    </Card>
  );
};

export default InvoiceCard;
