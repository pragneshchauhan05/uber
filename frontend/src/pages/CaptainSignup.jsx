import React, { useState, useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../Context/CaptainContext";
import { getApiBaseUrl } from "../config";

const CaptainSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [, setCaptain] = useContext(CaptainDataContext);
  const navigate = useNavigate();

  if (localStorage.getItem("captainToken")) {
    return <Navigate to="/captain-home" replace />;
  }

  const validateFirstName = (val) => {
    if (!val.trim()) return "First name is required.";
    if (val.trim().length < 3) return "First name must be at least 3 characters.";
    return "";
  };

  const validateEmail = (val) => {
    if (!val.trim()) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address.";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required.";
    if (val.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const validateVehicleColor = (val) => {
    if (!val.trim()) return "Vehicle color is required.";
    const colorRegex = /^[A-Za-z\s]+$/;
    if (!colorRegex.test(val.trim())) return "Color must contain only letters (e.g. Black, White).";
    return "";
  };

  const validateVehiclePlate = (val) => {
    if (!val.trim()) return "Number plate is required.";
    const plateRegex = /^[A-Za-z]{2}\s?\d{2}\s?[A-Za-z]{1,2}\s?\d{4,}$/;
    if (!plateRegex.test(val.trim())) {
      return "Format must be like: GJ 05 AH 5358";
    }
    return "";
  };

  const validateVehicleCapacity = (val) => {
    if (!val) return "Capacity is required.";
    const num = Number(val);
    if (isNaN(num) || num < 1) return "Capacity must be at least 1.";
    if (num > 6) return "Max capacity is 6 passengers.";
    return "";
  };

  const validateVehicleType = (val) => {
    if (!val) return "Please select a vehicle type.";
    return "";
  };

  const validateAll = () => {
    const errs = {
      firstName: validateFirstName(firstName),
      email: validateEmail(email),
      password: validatePassword(password),
      vehicleColor: validateVehicleColor(vehicleColor),
      vehiclePlate: validateVehiclePlate(vehiclePlate),
      vehicleCapacity: validateVehicleCapacity(vehicleCapacity),
      vehicleType: validateVehicleType(vehicleType),
    };
    setErrors(errs);
    setTouched({
      firstName: true,
      email: true,
      password: true,
      vehicleColor: true,
      vehiclePlate: true,
      vehicleCapacity: true,
      vehicleType: true,
    });
    return Object.values(errs).every((x) => x === "");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "firstName") setErrors((prev) => ({ ...prev, firstName: validateFirstName(firstName) }));
    if (field === "email") setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    if (field === "password") setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    if (field === "vehicleColor") setErrors((prev) => ({ ...prev, vehicleColor: validateVehicleColor(vehicleColor) }));
    if (field === "vehiclePlate") setErrors((prev) => ({ ...prev, vehiclePlate: validateVehiclePlate(vehiclePlate) }));
    if (field === "vehicleCapacity") setErrors((prev) => ({ ...prev, vehicleCapacity: validateVehicleCapacity(vehicleCapacity) }));
    if (field === "vehicleType") setErrors((prev) => ({ ...prev, vehicleType: validateVehicleType(vehicleType) }));
  };

  const handleVehicleTypeChange = (e) => {
    const selectedType = e.target.value;
    setVehicleType(selectedType);
    setServerError("");

    if (selectedType === "motorcycle") {
      setVehicleCapacity("1");
      setErrors((prev) => ({ ...prev, vehicleCapacity: "" }));
    } else if (selectedType === "auto") {
      setVehicleCapacity("3");
      setErrors((prev) => ({ ...prev, vehicleCapacity: "" }));
    } else if (selectedType === "car") {
      setVehicleCapacity("4");
      setErrors((prev) => ({ ...prev, vehicleCapacity: "" }));
    }

    if (touched.vehicleType) {
      setErrors((prev) => ({ ...prev, vehicleType: validateVehicleType(selectedType) }));
    }
  };

  const handleCapacityChange = (e) => {
    let val = e.target.value;
    if (val !== "" && Number(val) > 6) {
      val = "6";
    }
    setVehicleCapacity(val);
    setServerError("");
    if (touched.vehicleCapacity) {
      setErrors((prev) => ({ ...prev, vehicleCapacity: validateVehicleCapacity(val) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) return;

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
      const baseUrl = getApiBaseUrl();
      const response = await axios.post(
        `${baseUrl}/captains/register`,
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
        "Unable to register as captain. Please check your details.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-screen bg-gray-50 flex justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col justify-between border border-gray-100 min-h-[620px]">
        <div>
          <div className="flex items-center justify-between mb-6">
            <img className="w-20" src="/uber.png" alt="Uber" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
              <i className="ri-steering-2-fill text-sm"></i> Driver Registration
            </span>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
              <i className="ri-error-warning-fill text-lg text-red-500 shrink-0"></i>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Personal Information
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <input
                    type="text"
                    value={firstName}
                    className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                      touched.firstName && errors.firstName
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                    placeholder="First name"
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (touched.firstName) setErrors((prev) => ({ ...prev, firstName: validateFirstName(e.target.value) }));
                    }}
                    onBlur={() => handleBlur("firstName")}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={lastName}
                    className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                    placeholder="Last name"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <input
                  type="email"
                  value={email}
                  className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                    touched.email && errors.email
                      ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                  }`}
                  placeholder="Driver email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={() => handleBlur("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                    touched.password && errors.password
                      ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                  }`}
                  placeholder="Password (min 6 chars)"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                  }}
                  onBlur={() => handleBlur("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i> {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1 pt-1">
                Vehicle Information
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <input
                    type="text"
                    value={vehicleColor}
                    className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                      touched.vehicleColor && errors.vehicleColor
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                    placeholder="Color (e.g. Black)"
                    onChange={(e) => {
                      const val = e.target.value;
                      setVehicleColor(val);
                      if (touched.vehicleColor) setErrors((prev) => ({ ...prev, vehicleColor: validateVehicleColor(val) }));
                    }}
                    onBlur={() => handleBlur("vehicleColor")}
                  />
                  {touched.vehicleColor && errors.vehicleColor && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                      {errors.vehicleColor}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={vehiclePlate}
                    className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 uppercase ${
                      touched.vehiclePlate && errors.vehiclePlate
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                    placeholder="Plate (GJ 05 AH 5358)"
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setVehiclePlate(val);
                      if (touched.vehiclePlate) setErrors((prev) => ({ ...prev, vehiclePlate: validateVehiclePlate(val) }));
                    }}
                    onBlur={() => handleBlur("vehiclePlate")}
                  />
                  {touched.vehiclePlate && errors.vehiclePlate && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                      {errors.vehiclePlate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={vehicleType}
                    className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 focus:bg-white focus:outline-none transition-all duration-200 cursor-pointer ${
                      touched.vehicleType && errors.vehicleType
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                    onChange={handleVehicleTypeChange}
                    onBlur={() => handleBlur("vehicleType")}
                  >
                    <option value="">Vehicle type</option>
                    <option value="car">Car (UberX / Sedan)</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="auto">Auto Rikshaw</option>
                  </select>
                  {touched.vehicleType && errors.vehicleType && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                      {errors.vehicleType}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    value={vehicleCapacity}
                    min="1"
                    max="6"
                    className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                      touched.vehicleCapacity && errors.vehicleCapacity
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                    placeholder="Seats (max 6)"
                    onChange={handleCapacityChange}
                    onBlur={() => handleBlur("vehicleCapacity")}
                  />
                  {touched.vehicleCapacity && errors.vehicleCapacity && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                      {errors.vehicleCapacity}
                    </p>
                  )}
                </div>
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
