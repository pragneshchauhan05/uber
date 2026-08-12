import { createContext, useState } from "react";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState({
    email: "",
    fullName: {
      firstName: "",
      lastName: "",
    },
    vehicle: {
      color: "",
      plate: "",
      capacity: 0,
      vehicleType: "",
    },
    status: "inactive",
  });

  return (
    <CaptainDataContext.Provider value={[captain, setCaptain]}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
