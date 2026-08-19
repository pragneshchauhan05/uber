import React, { useContext } from "react";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainDetails = () => {
  const [captain] = useContext(CaptainDataContext);

  const firstName =
    captain?.fullname?.firstname ||
    captain?.fullName?.firstName ||
    "Captain";
  const lastName =
    captain?.fullname?.lastname ||
    captain?.fullName?.lastName ||
    "";
  const name = `${firstName} ${lastName}`.trim();

  const rawEarnings = captain?.earnings ?? 0;
  const formattedEarnings = typeof rawEarnings === "number" ? rawEarnings.toLocaleString("en-IN") : rawEarnings;

  return (
    <div>
      {/* Driver Info Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=3000&auto=format&fit=crop"
            alt={name}
          />
          <div>
            <h4 className="text-base font-bold text-gray-900 capitalize">{name}</h4>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {captain?.vehicle?.plate || "GJ01AB1234"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h4 className="text-xl font-extrabold text-gray-900">₹{formattedEarnings}</h4>
          <p className="text-xs font-semibold text-emerald-600">Earned today</p>
        </div>
      </div>

      {/* Driver Performance Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-1">
            <i className="ri-timer-line text-lg"></i>
          </div>
          <h5 className="text-base font-bold text-gray-900">{captain?.hoursOnline ?? "10.5"}h</h5>
          <p className="text-[11px] font-semibold text-gray-500">Hours Online</p>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
          <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-1">
            <i className="ri-speed-up-line text-lg"></i>
          </div>
          <h5 className="text-base font-bold text-gray-900">{captain?.totalDistance ?? "10.5"} km</h5>
          <p className="text-[11px] font-semibold text-gray-500">KM Driven</p>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-1">
            <i className="ri-star-fill text-lg"></i>
          </div>
          <h5 className="text-base font-bold text-gray-900">{captain?.rating ?? "4.9"}</h5>
          <p className="text-[11px] font-semibold text-gray-500">Rating</p>
        </div>
      </div>
    </div>
  );
};

export default CaptainDetails;

