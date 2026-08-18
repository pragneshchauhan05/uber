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
  const [isLoading, setIsLoading] = useState(false);

  const [, setCaptain] = useContext(CaptainDataContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md min-h-screen md:min-h-[820px] md:h-auto bg-white md:rounded-3xl shadow-xl p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <img className="w-20" src="/uber.png" alt="Uber" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
              <i className="ri-steering-2-fill text-sm"></i> Driver Registration
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Personal Information
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={firstName}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  placeholder="First name"
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  value={lastName}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  placeholder="Last name"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <input
                type="email"
                value={email}
                className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200 mb-3"
                required
                placeholder="Driver email"
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                value={password}
                className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                required
                placeholder="Password (min 6 chars)"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1 pt-1">
                Vehicle Information
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={vehicleColor}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  placeholder="Vehicle color"
                  onChange={(e) => setVehicleColor(e.target.value)}
                />
                <input
                  type="text"
                  value={vehiclePlate}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  placeholder="Plate (GJ01AB1234)"
                  onChange={(e) => setVehiclePlate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={vehicleCapacity}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  min="1"
                  placeholder="Capacity (seats)"
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                />
                <select
                  value={vehicleType}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200 cursor-pointer"
                  required
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Vehicle type</option>
                  <option value="car">Car (UberX / Sedan)</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="auto">Auto Rikshaw</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-lg shadow-black/10 flex justify-center items-center cursor-pointer disabled:opacity-60 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Register as Driver"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 pt-1">
              Already registered?{" "}
              <Link
                to="/captain-login"
                className="font-semibold text-black hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By registering as a driver, you agree to partner standards and
            terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptainSignup;
