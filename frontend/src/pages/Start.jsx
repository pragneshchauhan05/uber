import React from "react";
import { Link, Navigate } from "react-router-dom";

const Start = () => {
  const userToken = localStorage.getItem("token");
  const captainToken = localStorage.getItem("captainToken");

  if (userToken) {
    return <Navigate to="/home" replace />;
  }

  if (captainToken) {
    return <Navigate to="/captain-home" replace />;
  }
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col justify-between bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1527603815363-e79385e0747e?q=80&w=676&auto=format&fit=crop&ixlib=rb-4.1.0')]">
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10 p-8 pt-10">
          <img
            className="w-24 drop-shadow-md"
            src="/images  -removebg-preview.png"
            alt="Uber"
          />
        </div>

        {/* Bottom Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 pt-7 rounded-t-3xl border-t border-white/20 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Get started with Uber
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Reliable rides, anytime and anywhere.
          </p>
          <Link
            to="/login"
            className="flex justify-center items-center bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 w-full text-white font-semibold text-lg py-3.5 px-4 rounded-xl mt-6 shadow-lg shadow-black/10"
          >
            Continue
            <i className="ri-arrow-right-line ml-2 text-xl"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Start;
