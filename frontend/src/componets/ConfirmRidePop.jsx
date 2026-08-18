import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ConfirmRidePop = (props) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
        {
          params: {
            rideId: props.ride?._id,
            otp: otp,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
          },
        },
      );

      if (response.status === 200) {
        props.setConfirmRidePopUpPanel(false);
        navigate("/captain-riding", { state: { ride: response.data } });
      }
    } catch (err) {
      console.error("Error starting ride:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const userFirstName = props.ride?.user?.fullname?.firstname || "User";
  const userLastName = props.ride?.user?.fullname?.lastname || "";
  const userName = `${userFirstName} ${userLastName}`.trim();

  const distanceKm = props.ride?.distance
    ? typeof props.ride.distance === "number"
      ? (props.ride.distance / 1000).toFixed(1) + " km"
      : props.ride.distance
    : "2.2 km";

  const handleCancelRide = async () => {
    try {
      if (props.ride?._id) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/cancel-ride`,
          { rideId: props.ride._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
            },
          },
        );
      }
    } catch (err) {
      console.error("Error cancelling ride:", err);
    } finally {
      props.setConfirmRidePopUpPanel(false);
    }
  };

  return (
    <div>
      <div
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
        onClick={handleCancelRide}
      ></div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Verify Trip PIN
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Request the start PIN from your passenger
          </p>
        </div>
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          {distanceKm}
        </span>
      </div>

      {/* Passenger Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=3000&auto=format&fit=crop"
            alt={userName}
          />
          <div>
            <h4 className="text-base font-bold text-gray-900 capitalize leading-tight">{userName}</h4>
            <p className="text-xs text-gray-500 font-medium">Passenger Confirmed</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-xl font-extrabold text-gray-900">₹{props.ride?.fare ?? "0"}</h3>
        </div>
      </div>

      {/* Route Details */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{props.ride?.pickup}</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-600 rounded-sm"></div>
          <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{props.ride?.destination}</h4>
        </div>
      </div>

      {/* PIN Verification Form */}
      <form onSubmit={submitHandler} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 text-center">
            Enter Trip PIN
          </label>
          <input
            type="text"
            placeholder="• • • • • •"
            className="w-full bg-gray-100 border-2 border-gray-200 focus:bg-white focus:border-black rounded-2xl py-3 text-center text-2xl font-mono font-extrabold tracking-widest text-gray-900 focus:outline-none transition-all duration-200"
            value={otp}
            maxLength={6}
            required
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all duration-200 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg shadow-emerald-600/20 flex justify-center items-center cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Verify & Start Trip"
          )}
        </button>

        <button
          type="button"
          onClick={handleCancelRide}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm transition-all cursor-pointer"
        >
          Cancel Request
        </button>
      </form>
    </div>
  );
};

export default ConfirmRidePop;
