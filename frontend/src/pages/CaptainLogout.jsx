import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CaptainLogout = () => {
  const token = localStorage.getItem("captainToken");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post(
        `${import.meta.env.VITE_BASE_URL}/captains/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        localStorage.removeItem("captainToken");
        navigate("/captain-login");
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("captainToken");
        navigate("/captain-login");
      });
  }, []);

  return <div>Logging out...</div>;
};

export default CaptainLogout;
