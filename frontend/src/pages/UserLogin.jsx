import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../Context/UserContext";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useContext(UserDataContext);
  const navigate = useNavigate();


  const submitHandler = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        userData
      );

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        navigate("/home");
      }
    } catch (err) {
      const resData = err.response?.data;
      // Backend returns { errors: [...] } on validation, { message: "..." } on bad credentials
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
        <img className="w-20  mb-10" src="/uber.png" alt="Uber" />
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
            placeholder="Enter your password (min 6 characters)"
          />
          <button type="submit" className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base">
            Login
          </button>
          <p className="text-center">
            New here?
            <Link to="/signup" className="text-blue-600">
              Create New Account
            </Link>
          </p>
        </form>
      </div>
      <div>
        <Link
          to="/captain-login"
          className="bg-[#10b461] flex items-center justify-center text-white font-semibold mb-5 rounded px-4 py-2  w-full text-lg placeholder:text-base"
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
