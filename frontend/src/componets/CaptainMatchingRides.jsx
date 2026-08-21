import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const CaptainMatchingRides = ({ routeId, routeInfo, onClose, onActionSuccess }) => {
  const [matchingRides, setMatchingRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchMatchingRides = async () => {
    if (!routeId) return;
    setIsLoading(true);
    setError("");
    setActionMessage("");

    try {
      const token = localStorage.getItem("captainToken");
      const response = await axios.get(
        `${getApiBaseUrl()}/api/captain/routes/${routeId}/matches`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(response.data)) {
        // Ensure sorted by matchScore descending
        const sorted = [...response.data].sort((a, b) => b.matchScore - a.matchScore);
        setMatchingRides(sorted);
      } else {
        setMatchingRides([]);
      }
    } catch (err) {
      console.error("Error fetching matching rides for captain route:", err);
      if (err.response?.status === 403) {
        setError("Unauthorized access to this route's matching rides.");
      } else {
        setError(err.response?.data?.message || "Unable to load matching rides.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchingRides();
  }, [routeId]);

  const handleAcceptRide = async (match) => {
    setActionLoadingId(match.rideRequestId);
    setActionMessage("");

    try {
      const token = localStorage.getItem("captainToken");
      const response = await axios.post(
        `${getApiBaseUrl()}/api/captain/routes/accept-ride`,
        {
          routeId,
          rideRequestId: match.rideRequestId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setActionMessage(`CONFIRMED: Reserved seat for ${match.userName}!`);
        setMatchingRides((prev) => prev.filter((r) => r.rideRequestId !== match.rideRequestId));
        if (onActionSuccess) onActionSuccess();
      }
    } catch (err) {
      console.error("Error accepting ride:", err);
      if (err.response?.status === 409) {
        alert(err.response.data.message || "This ride request has already been confirmed by another Captain.");
        setMatchingRides((prev) => prev.filter((r) => r.rideRequestId !== match.rideRequestId));
      } else {
        alert(err.response?.data?.message || "Failed to accept ride request.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRide = async (match) => {
    setActionLoadingId(match.rideRequestId);
    setActionMessage("");

    try {
      const token = localStorage.getItem("captainToken");
      const response = await axios.post(
        `${getApiBaseUrl()}/api/captain/routes/reject-ride`,
        {
          routeId,
          rideRequestId: match.rideRequestId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setActionMessage(`Dismissed ride request from ${match.userName}.`);
        setMatchingRides((prev) => prev.filter((r) => r.rideRequestId !== match.rideRequestId));
      }
    } catch (err) {
      console.error("Error rejecting ride:", err);
      alert(err.response?.data?.message || "Failed to reject ride request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4 space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
            <i className="ri-[#10B981] ri-user-shared-line text-emerald-600"></i> Matching Rides
          </h3>
          {routeInfo && (
            <p className="text-[11px] text-gray-500 truncate max-w-[220px]">
              {routeInfo.startLocation?.address} → {routeInfo.destination?.address}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatchingRides}
            title="Refresh Matching Rides"
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-refresh-line"></i> Refresh
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors cursor-pointer text-base"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {actionMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="text-emerald-700 font-bold text-xs">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Content States */}
      {isLoading ? (
        <div className="py-6 text-center text-gray-500 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs font-semibold">Finding matching User ride requests...</p>
        </div>
      ) : error ? (
        <div className="py-4 text-center bg-red-50 border border-red-100 rounded-2xl p-3 text-red-600 text-xs font-semibold">
          <p>{error}</p>
          <button
            onClick={fetchMatchingRides}
            className="mt-2 text-black underline font-bold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : matchingRides.length === 0 ? (
        <div className="py-6 text-center bg-white rounded-2xl border border-gray-200 p-4">
          <i className="ri-user-search-line text-3xl text-gray-400 mb-1 block"></i>
          <h4 className="text-xs font-bold text-gray-800">No Matching Rides Right Now</h4>
          <p className="text-[11px] text-gray-500 mt-1">
            No rider requests currently match your route polyline and departure schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-0.5">
          {matchingRides.map((match) => {
            const pickupAddr = match.pickup?.address || "Pickup";
            const dropAddr = match.drop?.address || "Drop";

            return (
              <div
                key={match.rideRequestId}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-black transition-all space-y-2.5"
              >
                {/* User Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 capitalize">
                      User: {match.userName}
                    </h4>
                    {match.userEmail && (
                      <p className="text-[10px] text-gray-400 font-medium">{match.userEmail}</p>
                    )}
                  </div>
                  <div className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <i className="ri-flashlight-fill text-amber-300"></i>
                    Route Match: {match.matchScore}%
                  </div>
                </div>

                {/* Pickup & Drop Details */}
                <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-black rounded-full mt-1 shrink-0"></span>
                    <p className="text-gray-800 font-semibold line-clamp-1">
                      <strong className="text-gray-500 uppercase text-[10px]">Pickup:</strong> {pickupAddr}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-emerald-600 rounded-sm mt-1 shrink-0"></span>
                    <p className="text-gray-800 font-semibold line-clamp-1">
                      <strong className="text-gray-500 uppercase text-[10px]">Drop:</strong> {dropAddr}
                    </p>
                  </div>
                </div>

                {/* Proximity Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-700">
                  <div className="bg-blue-50 text-blue-800 px-2.5 py-1.5 rounded-xl border border-blue-100">
                    📍 Pickup Distance: {match.pickupDistance}m
                  </div>
                  <div className="bg-purple-50 text-purple-800 px-2.5 py-1.5 rounded-xl border border-purple-100">
                    🏁 Drop Distance: {match.dropDistance}m
                  </div>
                </div>

                {/* Accept / Reject Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAcceptRide(match)}
                    disabled={actionLoadingId === match.rideRequestId}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === match.rideRequestId ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <i className="ri-checkbox-circle-line text-sm"></i>
                        <span>Accept Ride</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRejectRide(match)}
                    disabled={actionLoadingId === match.rideRequestId}
                    className="px-4 bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CaptainMatchingRides;
