import Nav from "@/components/nav/nav";
import AdminFastenersPage from "./helper";

const Fasteners = () => {
  return (
    <Nav>
      <div className="flex w-full flex-col justify-start dark:bg-dark">
      
        <div className="w-full">
          
          <AdminFastenersPage />
        </div>
      </div>
    </Nav>
  );
};

export default Fasteners;