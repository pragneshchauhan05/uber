import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const CaptainRouteList = ({ onSelectCaptainRoute }) => {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActiveRoutes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${getApiBaseUrl()}/api/routes/all`);
      if (response.data && Array.isArray(response.data.routes)) {
        setRoutes(response.data.routes);
      }
    } catch (err) {
      console.error("Error fetching active captain routes:", err);
      setError("Unable to load active Captain routes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRoutes();
  }, []);

  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500">
        <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs font-semibold">Loading available Captain routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-red-500 text-xs font-semibold">
        {error}
        <button
          onClick={fetchActiveRoutes}
          className="block mx-auto mt-2 text-black underline text-xs font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="py-8 text-center bg-gray-50 rounded-2xl border border-gray-100 p-4">
        <i className="ri-map-pin-user-line text-3xl text-gray-400 mb-2 block"></i>
        <h4 className="text-sm font-bold text-gray-800">No Captain Routes Available</h4>
        <p className="text-xs text-gray-500 mt-1">
          No captains have published planned routes right now. You can book an instant ride above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Available Captain Routes ({routes.length})
        </span>
        <button
          onClick={fetchActiveRoutes}
          className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <i className="ri-refresh-line"></i> Refresh
        </button>
      </div>

      {routes.map((routeItem) => {
        const captain = routeItem.captain || {};
        const firstName = captain.fullname?.firstname || captain.fullName?.firstName || "Captain";
        const lastName = captain.fullname?.lastname || captain.fullName?.lastName || "";
        const captainName = `${firstName} ${lastName}`.trim();

        const vehiclePlate = captain.vehicle?.plate || "GJ01AB1234";
        const vehicleColor = captain.vehicle?.color || "";
        const vehicleType = captain.vehicle?.vehicleType || "Car";
        const rating = captain.rating || "4.9";
        const seatsLeft = (routeItem.availableSeats || 1) - (routeItem.seatsBooked || 0);

        return (
          <div
            key={routeItem._id}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-black transition-all cursor-pointer"
          >
            {/* Captain Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=3000&auto=format&fit=crop"
                  alt={captainName}
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight capitalize">
                    {captainName}
                  </h4>
                  <p className="text-[11px] font-semibold text-gray-500 capitalize">
                    {vehicleColor} {vehicleType} • <span className="uppercase">{vehiclePlate}</span>
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 text-amber-700 text-xs font-extrabold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <i className="ri-star-fill text-amber-500"></i>
                {rating}
              </div>
            </div>

            {/* Route Points */}
            <div className="space-y-2 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 bg-black rounded-full mt-1 shrink-0"></span>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Start</span>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                    {routeItem.startLocation?.address}
                  </p>
                </div>
              </div>
              <div className="border-l border-dashed border-gray-300 ml-1 pl-3 py-0.5"></div>
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm mt-1 shrink-0"></span>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Destination</span>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                    {routeItem.destination?.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule & Seats */}
            <div className="flex items-center justify-between text-xs text-gray-600 mb-3 font-semibold">
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                <i className="ri-calendar-event-line text-gray-800"></i>
                <span>{routeItem.departureDate} at {routeItem.departureTime}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <i className="ri-user-user-line"></i>
                <span>{seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left</span>
              </div>
            </div>

            {/* Select Captain Action */}
            <button
              onClick={() => onSelectCaptainRoute(routeItem)}
              className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Select {captainName} for Ride</span>
              <i className="ri-arrow-right-line text-sm"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CaptainRouteList;
