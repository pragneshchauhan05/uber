import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setUserData({
      userName: {
        firstName: firstName,
        lastName: lastName,
      },
      email: email,
      password: password,
    });
    console.log(userData);
  };
  return (
    <div className="p-7 flex flex-col justify-between  h-screen">
      <div>
        <img className="w-20  mb-3" src="/public/uber.svg" alt="Uber" />
        <form onSubmit={handleSubmit}>
          <h3 className="text-base font-medium mb-2">What's your name</h3>
          <div className="flex gap-4 mb-5">
            <input
              type="text"
              className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-base placeholder:text-sm"
              required
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-base placeholder:text-sm"
              required
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <h3 className="text-base font-medium mb-2">What is your email?</h3>
          <input
            type="email"
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-base placeholder:text-sm"
            required
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <h3 className="text-base font-medium mb-2">Enter Password</h3>
          <input
            type="password"
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-base placeholder:text-sm"
            required
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base">
            Login
          </button>
          <p className="text-center">
            Alredy have a account?
            <Link to="/login" className="text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
      <div>
        <p className="text-center text-xs text-gray-500">
          This site is protected by reCAPTCHA and the{" "}
          <span className="text-blue-600 underline">Google Privacy Policy</span>
          and <span className="text-blue-600 underline">
            Terms of Service
          </span>{" "}
          apply.
        </p>
      </div>
    </div>
  );
};

export default UserSignup;
