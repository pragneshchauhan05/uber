import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserLogout = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        localStorage.removeItem("token");
        navigate("/login");
      })
      .catch((err) => {
        console.error(err);

        localStorage.removeItem("token");
        navigate("/login");
      });
  }, []);

  return <div>Logging out...</div>;
};

export default UserLogout;
