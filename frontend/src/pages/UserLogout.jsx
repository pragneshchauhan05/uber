import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "../config";

const UserLogout = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      navigate("/login", { replace: true });
    };

    axios
      .get(`${getApiBaseUrl()}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        cleanup();
      })
      .catch((err) => {
        console.error("Logout error:", err);
        cleanup();
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
      <img className="w-24 h-auto object-contain mb-6" src="https://download.logo.wine/logo/Uber/Uber-Logo.wine.png" alt="Uber" />
      <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-gray-500 mt-4 tracking-wider uppercase">Logging out...</p>
    </div>
  );
};

export default UserLogout;
