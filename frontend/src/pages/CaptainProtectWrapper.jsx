import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("captainToken");
  const [captain, setCaptain] = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:4000";
    axios
      .get(`${baseUrl}/captains/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      .then((res) => {
        setCaptain(res.data.captain);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("captainToken");
        navigate("/captain-login");
        setIsLoading(false);
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/captain-login" replace />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return children;
};

export default CaptainProtectWrapper;
