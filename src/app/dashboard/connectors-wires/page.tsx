import Nav from "@/components/nav/nav";
import AdminConnectorsWiresPage from "./helper";


const Fasteners = () => {
  return (
    <Nav>
      <div className="flex w-full flex-col justify-start">
       
        <div className="w-full">
          <AdminConnectorsWiresPage />
        </div>
      </div>
    </Nav>
  );
};

export default Fasteners;