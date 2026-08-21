import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserDataContext } from "../Context/UserContext";
import { getApiBaseUrl } from "../config";

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useContext(UserDataContext);
  const isUserLoaded = Boolean(user && (user._id || (user.email && user.email.length > 0)));
  const [isLoading, setIsLoading] = useState(!isUserLoaded);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const baseUrl = getApiBaseUrl();
    axios
      .get(`${baseUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!isUserLoaded) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setIsLoading(false);
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
        <img className="w-20 mb-6" src="/uber.png" alt="Uber" />
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-500 mt-4 tracking-wider uppercase">Authenticating...</p>
      </div>
    );
  }

  return children;
};

export default UserProtectWrapper;
