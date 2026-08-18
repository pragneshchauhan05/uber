import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [, setCaptain] = useContext(CaptainDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        { email, password },
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
      setIsLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md min-h-screen md:min-h-[750px] md:h-auto bg-white md:rounded-3xl shadow-xl p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <img className="w-20" src="/uber.png" alt="Uber" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
              <i className="ri-steering-2-fill text-sm"></i> Driver Portal
            </span>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Captain Email
              </label>
              <input
                type="email"
                className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="captain@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-lg shadow-black/10 flex justify-center items-center cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Driver Login"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 pt-2">
              Join a fleet?{" "}
              <Link
                to="/captain-signup"
                className="font-semibold text-black hover:underline"
              >
                Register as Captain
              </Link>
            </p>
          </form>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <Link
            to="/login"
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.99] transition-all duration-200 flex items-center justify-center text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-600/10 text-base"
          >
            <i className="ri-user-line mr-2 text-xl"></i>
            Sign in as Rider / User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;
