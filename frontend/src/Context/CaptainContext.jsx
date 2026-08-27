import { createContext, useState, useEffect } from "react";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(() => {
    try {
      const savedCaptain = localStorage.getItem("captain");
      return savedCaptain ? JSON.parse(savedCaptain) : {
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
      };
    } catch {
      return {
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
      };
    }
  });

  useEffect(() => {
    if (captain && (captain._id || captain.email)) {
      try {
        localStorage.setItem("captain", JSON.stringify(captain));
      } catch (err) {
        console.error("Error saving captain to localStorage", err);
      }
    }
  }, [captain]);

  return (
    <CaptainDataContext.Provider value={[captain, setCaptain]}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
