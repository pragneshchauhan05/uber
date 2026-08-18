import React from "react";
import axios from "axios";

const RidePopUp = (props) => {
  const userFirstName = props.ride?.user?.fullname?.firstname || "User";
  const userLastName = props.ride?.user?.fullname?.lastname || "";
  const userName = `${userFirstName} ${userLastName}`.trim();

  const distanceKm = props.ride?.distance
    ? typeof props.ride.distance === "number"
      ? (props.ride.distance / 1000).toFixed(1) + " km"
      : props.ride.distance
    : "2.2 km";

  const confirmRide = async () => {
    try {
      if (!props.ride?._id) {
        props.setConfirmRidePopUpPanel(true);
        props.setRidePopUpPanel(false);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        {
          rideId: props.ride._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
          },
        },
      );

      if (response.status === 200) {
        props.setConfirmRidePopUpPanel(true);
        props.setRidePopUpPanel(false);
      }
    } catch (error) {
      console.error("Error confirming ride:", error);
      props.setConfirmRidePopUpPanel(true);
      props.setRidePopUpPanel(false);
    }
  };

  return (
    <div>
      <div
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
        onClick={() => props.setRidePopUpPanel(false)}
      ></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            New Ride Request
          </h3>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          {distanceKm} away
        </span>
      </div>

      {/* Passenger Card Header */}
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
            <span className="text-xs text-gray-500 font-medium">
              Standard Passenger
            </span>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-xl font-extrabold text-gray-900">
            ₹{props.ride?.fare ?? "0"}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Est. Earnings
          </p>
        </div>
      </div>

      {/* Pickup & Destination Details */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 mb-5">
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

        <div className="border-l-2 border-dashed border-gray-300 ml-1 pl-4 -my-1 py-0.5"></div>

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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={confirmRide}
          className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg shadow-black/10 active:scale-[0.99] transition-all cursor-pointer flex justify-center items-center"
        >
          Accept Ride
        </button>
        <button
          onClick={() => props.setRidePopUpPanel(false)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-base transition-all cursor-pointer"
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default RidePopUp;
