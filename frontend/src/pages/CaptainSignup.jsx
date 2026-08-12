import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [captain, setCaptain] = useContext(CaptainDataContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newCaptain = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email,
      password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: Number(vehicleCapacity),
        vehicleType,
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        newCaptain,
      );

      if (response.status === 201) {
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
        "Unable to register. Check your backend or network.";
      alert(message);
    } finally {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setVehicleColor("");
      setVehiclePlate("");
      setVehicleCapacity("");
      setVehicleType("");
    }
  };

  return (
    <div className="p-7 flex flex-col justify-between  h-screen">
      <div>
        <img className="w-20  mb-3" src="/uber-driver.svg" alt="Uber" />
        <form onSubmit={handleSubmit}>
          <h3 className="text-base font-medium mb-2">What's your name</h3>
          <div className="flex gap-4 mb-5">
            <input
              type="text"
              value={firstName}
              className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-base placeholder:text-sm"
              required
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              value={lastName}
              className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-base placeholder:text-sm"
              required
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <h3 className="text-base font-medium mb-2">What is your email?</h3>
          <input
            type="email"
            value={email}
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-base placeholder:text-sm"
            required
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <h3 className="text-base font-medium mb-2">Enter Password</h3>
          <input
            type="password"
            value={password}
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-base placeholder:text-sm"
            required
            placeholder="Enter your password (min 6 chars)"
            onChange={(e) => setPassword(e.target.value)}
          />

          <h3 className="text-base font-medium mb-2">Vehicle Details</h3>
          <div className="flex gap-4 mb-3">
            <input
              type="text"
              value={vehicleColor}
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
              required
              placeholder="Vehicle color"
              onChange={(e) => setVehicleColor(e.target.value)}
            />
            <input
              type="text"
              value={vehiclePlate}
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
              required
              placeholder="Plate number"
              onChange={(e) => setVehiclePlate(e.target.value)}
            />
          </div>
          <div className="flex gap-4 mb-5">
            <input
              type="number"
              value={vehicleCapacity}
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base placeholder:text-sm"
              required
              min="1"
              placeholder="Capacity"
              onChange={(e) => setVehicleCapacity(e.target.value)}
            />
            <select
              value={vehicleType}
              className="bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-base"
              required
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="">Vehicle type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base"
          >
            Create Captain Account
          </button>
          <p className="text-center">
            Already have an account?{" "}
            <Link to="/captain-login" className="text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CaptainSignup;
