import React, { useState, useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../Context/UserContext";

import { getApiBaseUrl } from "../config";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [, setUser] = useContext(UserDataContext);
  const navigate = useNavigate();

  if (localStorage.getItem("token")) {
    const lastPath = sessionStorage.getItem("lastPath");
    const target = lastPath && lastPath !== "/" && !lastPath.includes("login") ? lastPath : "/home";
    return <Navigate to={target} replace />;
  }

  const validateEmail = (val) => {
    if (!val.trim()) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address (e.g. name@example.com).";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required.";
    if (val.length < 6) return "Password must be at least 6 characters long.";
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setServerError("");
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setServerError("");
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setServerError("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) {
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.post(
        `${baseUrl}/users/login`,
        { email, password },
      );

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      }
    } catch (err) {
      console.error("User login error:", err);
      const resData = err.response?.data;
      const message =
        resData?.message ||
        resData?.errors?.[0]?.msg ||
        "Invalid email or password. Please check your credentials.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md min-h-screen md:min-h-[750px] md:h-auto bg-white md:rounded-3xl shadow-xl p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <img className="w-20" src="/uber.png" alt="Uber" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Rider Login
            </span>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
              <i className="ri-error-warning-fill text-lg text-red-500 shrink-0"></i>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                What's your email?
              </label>
              <input
                type="email"
                className={`w-full bg-gray-100/80 border rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                  touched.email && errors.email
                    ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                }`}
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur("email")}
                placeholder="email@example.com"
              />
              {touched.email && errors.email && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Enter Password
              </label>
              <input
                type="password"
                className={`w-full bg-gray-100/80 border rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                  touched.password && errors.password
                    ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                }`}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                placeholder="Password (min 6 characters)"
              />
              {touched.password && errors.password && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i> {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-lg shadow-black/10 flex justify-center items-center cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Log In"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 pt-2">
              New to Uber?{" "}
              <Link
                to="/signup"
                className="font-semibold text-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <Link
            to="/captain-login"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all duration-200 flex items-center justify-center text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 text-base"
          >
            <i className="ri-steering-2-line mr-2 text-xl"></i>
            Sign in as Driver / Captain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
