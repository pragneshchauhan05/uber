import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const MatchingCaptainsPanel = ({ rideId, onSelectCaptainRoute, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingRouteId, setBookingRouteId] = useState(null);
  const [bookedSuccessMessage, setBookedSuccessMessage] = useState("");

  const fetchMatches = async () => {
    if (!rideId) {
      setError("No Ride Request ID provided.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setBookedSuccessMessage("");

    try {
      const response = await axios.get(`${getApiBaseUrl()}/api/routes/matches/${rideId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (Array.isArray(response.data)) {
        // Ensure sorted by highest match score descending
        const sorted = [...response.data].sort((a, b) => b.matchScore - a.matchScore);
        setMatches(sorted);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error("Error fetching matching Captain routes:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load matching Captain routes. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [rideId]);

  const handleRequestRide = async (match) => {
    setBookingRouteId(match.routeId);
    setBookedSuccessMessage("");

    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/api/routes/book`,
        {
          routeId: match.routeId,
          rideRequestId: rideId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setBookedSuccessMessage(`Ride Requested & Seat Booked with ${match.captainName}!`);
        // Update local availableSeats count
        setMatches((prev) =>
          prev.map((item) =>
            item.routeId === match.routeId
              ? { ...item, availableSeats: Math.max(0, item.availableSeats - 1), isBooked: true }
              : item
          )
        );

        if (onSelectCaptainRoute) {
          onSelectCaptainRoute(match);
        }
      }
    } catch (err) {
      console.error("Error requesting ride:", err);
      alert(err.response?.data?.message || "Failed to request ride with Captain.");
    } finally {
      setBookingRouteId(null);
    }
  };

  // Helper to check if departure time is in the past
  const isRouteExpired = (departureDate, departureTime) => {
    if (!departureDate) return false;
    try {
      let timeParts = departureTime ? departureTime.trim().split(":") : ["00", "00"];
      let hours = parseInt(timeParts[0], 10) || 0;
      let minutes = parseInt(timeParts[1], 10) || 0;

      const departureDateTime = new Date(`${departureDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
      if (!isNaN(departureDateTime.getTime())) {
        return departureDateTime.getTime() < Date.now();
      }
    } catch (e) {
      // fallback
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      {/* Panel Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 shrink-0">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="ri-team-line text-emerald-600"></i> Matching Captains
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Captains traveling along your journey
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatches}
            title="Refresh Matches"
            className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
          >
            <i className="ri-refresh-line text-base"></i>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {bookedSuccessMessage && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <i className="ri-checkbox-circle-fill text-emerald-600 text-base"></i>
            <span>{bookedSuccessMessage}</span>
          </div>
          <button
            onClick={() => setBookedSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-900 font-extrabold text-xs"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Content State Handling */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-500 my-auto">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-bold text-gray-700">Finding best matching Captains...</p>
          <span className="text-[11px] text-gray-400 mt-1">Analyzing route polyline & schedule</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center bg-red-50 border border-red-100 rounded-2xl p-4 my-auto">
          <i className="ri-error-warning-line text-3xl text-red-500 mb-2 block"></i>
          <h4 className="text-sm font-bold text-red-800">Unable to Fetch Matches</h4>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchMatches}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-200 p-5 my-auto">
          <i className="ri-car-line text-4xl text-gray-400 mb-2 block"></i>
          <h4 className="text-sm font-bold text-gray-800">No Matching Captain Found</h4>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            There are currently no active Captain routes matching your pickup & drop locations within 500m and 60 minutes.
          </p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {matches.map((match) => {
            const startAddr = match.startLocation?.address || "Start";
            const destAddr = match.destination?.address || "Destination";
            const expired = isRouteExpired(match.departureDate, match.departureTime);
            const noSeats = (match.availableSeats || 0) <= 0;
            const isDisabled = expired || noSeats || match.isBooked;

            return (
              <div
                key={match.routeId}
                className={`bg-white border rounded-2xl p-4 shadow-sm transition-all relative ${
                  match.isBooked
                    ? "border-emerald-500 bg-emerald-50/20"
                    : "border-gray-200 hover:border-black hover:shadow-md"
                }`}
              >
                {/* Top Badge: Route Match Score */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-gray-900 capitalize">
                      {match.captainName}
                    </h4>
                  </div>
                  <div className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <i className="ri-flashlight-fill text-amber-300"></i>
                    Route Match: {match.matchScore}%
                  </div>
                </div>

                {/* Route Header: Start -> Destination */}
                <div className="text-xs font-bold text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3 flex items-center gap-2">
                  <span className="text-gray-900 truncate">{startAddr}</span>
                  <i className="ri-arrow-right-line text-gray-400 shrink-0"></i>
                  <span className="text-gray-900 truncate">{destAddr}</span>
                </div>

                {/* Departure Time */}
                <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="ri-time-line text-gray-500"></i>
                  <span>
                    Departure: <strong className="text-gray-900">{match.departureDate} at {match.departureTime}</strong>
                  </span>
                </div>

                {/* Proximity Distances */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold mb-3">
                  <div className="bg-blue-50 text-blue-800 p-2 rounded-xl border border-blue-100 flex items-center gap-1.5">
                    <i className="ri-map-pin-2-fill text-blue-600"></i>
                    <span>Pickup distance: {match.pickupDistance}m</span>
                  </div>
                  <div className="bg-purple-50 text-purple-800 p-2 rounded-xl border border-purple-100 flex items-center gap-1.5">
                    <i className="ri-map-pin-user-fill text-purple-600"></i>
                    <span>Drop distance: {match.dropDistance}m</span>
                  </div>
                </div>

                {/* Seats & Status Footer */}
                <div className="flex items-center justify-between mb-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <i className="ri-user-user-line"></i>
                    <span>Seats: {match.availableSeats} available</span>
                  </div>

                  {expired ? (
                    <span className="text-red-600 bg-red-50 text-[11px] px-2.5 py-1 rounded-lg border border-red-200">
                      Expired Route
                    </span>
                  ) : noSeats ? (
                    <span className="text-amber-700 bg-amber-50 text-[11px] px-2.5 py-1 rounded-lg border border-amber-200">
                      No Seats Available
                    </span>
                  ) : null}
                </div>

                {/* Request Ride Action Button */}
                <button
                  onClick={() => handleRequestRide(match)}
                  disabled={isDisabled || bookingRouteId === match.routeId}
                  className={`w-full text-xs font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    match.isBooked
                      ? "bg-emerald-600 text-white cursor-default"
                      : isDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 active:scale-[0.99] text-white"
                  }`}
                >
                  {bookingRouteId === match.routeId ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Requesting...</span>
                    </>
                  ) : match.isBooked ? (
                    <>
                      <i className="ri-checkbox-circle-fill text-sm"></i>
                      <span>Ride Requested</span>
                    </>
                  ) : (
                    <>
                      <span>Request Ride</span>
                      <i className="ri-arrow-right-line text-sm"></i>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchingCaptainsPanel;
