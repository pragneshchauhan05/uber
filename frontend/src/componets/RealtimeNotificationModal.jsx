import React from "react";

/**
/ * RealtimeNotificationModal
 * Interactive toast / popup card for real-time Socket.IO notifications.
 * Handles both Captain (New Matching Ride) and User (Captain Found) events.
 */
const RealtimeNotificationModal = ({ notification, onClose, onViewRide }) => {
  if (!notification) return null;

  const { type, data } = notification;

  // 1. Captain Notification: New Matching Ride
  if (type === "ride:matched" || type === "ride:requested") {
    return (
      <div className="fixed top-5 right-5 left-5 md:left-auto md:w-96 z-50 animate-bounce-in">
        <div className="bg-black text-white p-4 rounded-3xl shadow-2xl border border-gray-800 backdrop-blur-xl relative overflow-hidden space-y-3">
          {/* Top Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500"></div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-base font-bold shadow-inner">
                🔔
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-white tracking-tight">New Matching Ride</h4>
                <p className="text-[10px] text-gray-400">Rider request matches your route</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-lg p-1"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* Body Content */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="font-bold text-gray-200">User: {data?.userName || "Rider"}</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Match: {data?.matchScore}%
              </span>
            </div>

            <div className="space-y-1 text-gray-300">
              <p className="line-clamp-1">
                <strong className="text-gray-400">Pickup:</strong> {data?.pickup}
              </p>
              <p className="line-clamp-1">
                <strong className="text-gray-400">Drop:</strong> {data?.drop}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onViewRide) onViewRide(data);
                onClose();
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Ride</span>
              <i className="ri-arrow-right-line"></i>
            </button>
            <button
              onClick={onClose}
              className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. User Notification: Captain Found / Ride Confirmed
  if (type === "ride:accepted" || type === "ride:confirmed") {
    return (
      <div className="fixed top-5 right-5 left-5 md:left-auto md:w-96 z-50 animate-bounce-in">
        <div className="bg-black text-white p-4 rounded-3xl shadow-2xl border border-gray-800 backdrop-blur-xl relative overflow-hidden space-y-3">
          {/* Top Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500"></div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-base font-bold shadow-inner">
                🚗
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-white tracking-tight">Ride Confirmed</h4>
                <p className="text-[10px] text-gray-400">Seat reserved & Captain assigned!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-lg p-1"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* Body Content */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="font-bold text-gray-200">Captain: {data?.captainName || "Rahul"}</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full">
                {data?.departureTime || "09:00 AM"}
              </span>
            </div>

            <div className="space-y-1 text-gray-300">
              <p className="line-clamp-1">
                <strong className="text-gray-400">Route:</strong> {data?.startLocation} → {data?.destination}
              </p>
              {data?.vehicle && (
                <p className="text-[11px] text-gray-400">
                  Vehicle: {data.vehicle.color} {data.vehicle.vehicleType} ({data.vehicle.plate})
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onViewRide) onViewRide(data);
                onClose();
              }}
              className="flex-1 bg-white hover:bg-gray-100 text-black font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Ride Details</span>
              <i className="ri-arrow-right-line"></i>
            </button>
            <button
              onClick={onClose}
              className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User Notification: Captain Rejected
  if (type === "ride:rejected") {
    return (
      <div className="fixed top-5 right-5 left-5 md:left-auto md:w-96 z-50">
        <div className="bg-red-950 text-white p-4 rounded-3xl shadow-2xl border border-red-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-red-200">Ride Request Update</h4>
            <button onClick={onClose} className="text-red-300 hover:text-white">
              <i className="ri-close-line"></i>
            </button>
          </div>
          <p className="text-xs text-red-100">
            A Captain was unable to accept your ride request. Searching for other matching Captains...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default RealtimeNotificationModal;
