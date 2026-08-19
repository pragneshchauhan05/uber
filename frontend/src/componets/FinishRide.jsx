import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const formatPrice = (val) => {
  if (val === undefined || val === null || val === "---") return "0";
  const num = Number(val);
  return isNaN(num) ? "0" : num.toLocaleString("en-IN");
};

const FinishRide = (props) => {
  const navigate = useNavigate();

  const userFirstName = props.ride?.user?.fullname?.firstname || "User";
  const userLastName = props.ride?.user?.fullname?.lastname || "";
  const userName = `${userFirstName} ${userLastName}`.trim();

  const distanceKm = props.ride?.distance
    ? typeof props.ride.distance === "number"
      ? (props.ride.distance / 1000).toFixed(1) + " km"
      : props.ride.distance
    : "2.2 km";

  const endRide = async () => {
    try {
      if (props.ride?._id) {
        await axios.post(
          `${getApiBaseUrl()}/rides/end-ride`,

          {
            rideId: props.ride._id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
            },
          },
        );
      }
      sessionStorage.removeItem("captainActiveRide");
      navigate("/captain-home");
    } catch (err) {
      console.error("Error ending ride:", err);
      sessionStorage.removeItem("captainActiveRide");
      navigate("/captain-home");
    }
  };

  return (
    <div>
      <div
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
        onClick={() => props.setFinishRidePanel(false)}
      ></div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Complete This Ride
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Arrived at passenger destination
          </p>
        </div>
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          {distanceKm}
        </span>
      </div>

      {/* Passenger Header Card */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=3000&auto=format&fit=crop"
            alt={userName}
          />
          <div>
            <h4 className="text-base font-bold text-gray-900 capitalize leading-tight">
              {userName}
            </h4>
            <span className="text-xs text-gray-500 font-medium">Passenger</span>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-xl font-extrabold text-emerald-600">
            ₹{formatPrice(props.ride?.fare)}
          </h3>
          <p className="text-[10px] font-bold text-emerald-700 uppercase">
            Collect Cash
          </p>
        </div>
      </div>

      {/* Route Timeline */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 bg-black rounded-full mt-1 shrink-0"></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Pickup Location
            </p>
            <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">
              {props.ride?.pickup}
            </h4>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm mt-1 shrink-0"></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Destination
            </p>
            <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">
              {props.ride?.destination}
            </h4>
          </div>
        </div>
      </div>

      <button
        onClick={endRide}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all duration-200 text-white font-bold py-4 rounded-2xl text-base shadow-xl shadow-emerald-600/20 cursor-pointer flex justify-center items-center"
      >
        <i className="ri-checkbox-circle-fill mr-2 text-xl"></i>
        Complete & Collect Fare
      </button>
    </div>
  );
};

export default FinishRide;
