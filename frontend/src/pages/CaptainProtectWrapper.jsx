import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../Context/CaptainContext";
import { getApiBaseUrl } from "../config";

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("captainToken");
  const [captain, setCaptain] = useContext(CaptainDataContext);
  const isCaptainLoaded = Boolean(captain && (captain._id || (captain.email && captain.email.length > 0)));
  const [isLoading, setIsLoading] = useState(!isCaptainLoaded);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const baseUrl = getApiBaseUrl();
    axios
      .get(`${baseUrl}/captains/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      })
      .then((res) => {
        if (res.data?.captain) {
          setCaptain(res.data.captain);
          localStorage.setItem("captain", JSON.stringify(res.data.captain));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Captain profile revalidation error:", err);
        const status = err.response?.status;
        if (status === 401 || !isCaptainLoaded) {
          localStorage.removeItem("captainToken");
          localStorage.removeItem("captain");
          navigate("/captain-login");
        }
        setIsLoading(false);
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/captain-login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
        <img className="w-20 mb-6" src="/uber.png" alt="Uber" />
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-500 mt-4 tracking-wider uppercase">Authenticating Captain...</p>
      </div>
    );
  }

  return children;
};

export default CaptainProtectWrapper;
