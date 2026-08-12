import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const [captain, setCaptain] = useContext(CaptainDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        { email, password }
      );

      if (response.status === 200) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("captainToken", data.token);
        navigate("/captain-home");
      }
    } catch (err) {
      const resData = err.response?.data;
      const message =
        resData?.errors?.[0]?.msg ||
        resData?.message ||
        "Login failed. Please try again.";
      alert(message);
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="p-7 flex flex-col justify-between  h-screen">
      <div>
        <img className="w-20  mb-3" src="/uber-driver.svg" alt="Uber" />
        <form onSubmit={submitHandler}>
          <h3 className="text-lg font-medium mb-2">What is your email?</h3>
          <input
            type="email"
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          <h3 className="text-lg font-medium mb-2">Enter Password</h3>
          <input
            type="password"
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base"
          >
            Login
          </button>
          <p className="text-center">
            Join a fleet?
            <Link to="/captain-signup" className="text-blue-600">
              Register as Captain
            </Link>
          </p>
        </form>
      </div>
      <div>
        <Link
          to="/login"
          className="bg-[#d5622d] flex items-center justify-center text-white font-semibold mb-5 rounded px-4 py-2  w-full text-lg placeholder:text-base"
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
