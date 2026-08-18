import React from "react";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const WaitingForDriver = (props) => {
  const captainFirstName =
    props.ride?.captain?.fullname?.firstname || "Captain";
  const captainLastName = props.ride?.captain?.fullname?.lastname || "";
  const captainName = `${captainFirstName} ${captainLastName}`.trim();

  const vehiclePlate = props.ride?.captain?.vehicle?.plate || "GJ 38 AB 5113";
  const vehicleType = props.ride?.captain?.vehicle?.vehicleType || "Car";
  const vehicleColor = props.ride?.captain?.vehicle?.color || "";
  const vehicleInfo = `${vehicleColor} ${vehicleType}`.trim();

  const handleCancelRide = async () => {
    try {
      if (props.ride?._id) {
        await axios.post(
          `${getApiBaseUrl()}/rides/cancel-ride`,

          { rideId: props.ride._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      }
    } catch (err) {
      console.error("Error cancelling ride:", err);
    } finally {
      if (props.setWaitingForDriver) props.setWaitingForDriver(false);
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
            Captain On The Way
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Provide start PIN to your captain
          </p>
        </div>
        <div className="bg-black text-white font-mono font-extrabold text-sm px-3.5 py-1.5 rounded-xl shadow-sm tracking-wider">
          PIN: {props.ride?.otp || "----"}
        </div>
      </div>

      {/* Driver & Vehicle Details Card */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                alt={captainName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900 capitalize leading-tight">
                {captainName}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <i className="ri-star-fill text-amber-500 text-xs"></i>
                <span className="text-xs font-bold text-gray-700">4.9</span>
                <span className="text-xs text-gray-400">
                  • Top Rated Captain
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">
              {vehiclePlate}
            </h4>
            <p className="text-xs font-medium text-gray-500 capitalize">
              {vehicleInfo}
            </p>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-200/60">
          <button className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold text-xs hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer">
            <i className="ri-phone-fill text-emerald-600 text-sm"></i> Call Captain
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold text-xs hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer">
            <i className="ri-chat-3-fill text-blue-600 text-sm"></i> Message Captain
          </button>
        </div>
      </div>

      {/* Trip Details Card */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 mb-4">
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
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
          <span className="text-xs font-semibold text-gray-500">Trip Fare</span>
          <span className="text-base font-extrabold text-gray-900">
            ₹{props.ride?.fare ?? "0"}
          </span>
        </div>
      </div>

      <button
        onClick={handleCancelRide}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm transition-all cursor-pointer"
      >
        Cancel Ride
      </button>
    </div>
  );
};

export default WaitingForDriver;

