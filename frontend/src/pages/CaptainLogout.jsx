import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "../config";

const CaptainLogout = () => {
  const token = localStorage.getItem("captainToken");
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = () => {
      localStorage.removeItem("captainToken");
      sessionStorage.clear();
      navigate("/captain-login", { replace: true });
    };

    axios
      .post(
        `${getApiBaseUrl()}/captains/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        cleanup();
      })
      .catch((err) => {
        console.error("Captain logout error:", err);
        cleanup();
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
      <img className="w-20 mb-6" src="/uber.png" alt="Uber" />
      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-gray-500 mt-4 tracking-wider uppercase">Logging out Captain...</p>
    </div>
  );
};

export default CaptainLogout;
