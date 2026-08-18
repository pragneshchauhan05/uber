import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
          `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
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
      navigate("/captain-home");
    } catch (err) {
      console.error("Error ending ride:", err);
      navigate("/captain-home");
    }
  };

  return (
    <div>
      <div>
        <h5
          className="p-1 text-center w-[93%] top-0 absolute cursor-pointer"
          onClick={() => {
            props.setFinishRidePanel(false);
          }}
        >
          <i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className="text-xl font-semibold mb-5">Finish This Ride</h3>
        <div className="flex items-center justify-between m-5 bg-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-5">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww"
              alt={userName}
            />
            <h2 className="text-xl font-semibold">{userName}</h2>
          </div>
          <h5 className="text-lg font-semibold">{distanceKm}</h5>
        </div>
        <div className="flex justify-between flex-col items-center gap-5">
          <div className="w-full">
            <div className="flex item-center gap-5 p-3">
              <i className="ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">
                  {props.ride?.pickup
                    ? props.ride.pickup.split(",")[0]
                    : "Pickup Location"}
                </h3>
                <p className="text-sm text-gray-600 -m-1">
                  {props.ride?.pickup || ""}
                </p>
              </div>
            </div>
            <div className="flex item-center gap-5 p-3 mt-3">
              <i className="ri-map-pin-user-fill"></i>
              <div>
                <h3 className="text-lg font-medium">
                  {props.ride?.destination
                    ? props.ride.destination.split(",")[0]
                    : "Destination Location"}
                </h3>
                <p className="text-sm text-gray-600 -m-1">
                  {props.ride?.destination || ""}
                </p>
              </div>
            </div>
            <div className="flex item-center gap-5 p-3 mt-3">
              <i className="ri-wallet-3-fill"></i>
              <div>
                <h3 className="text-lg font-medium">₹{props.ride?.fare ?? "0"}</h3>
                <p className="text-sm text-gray-600 -m-1">Cash</p>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full">
            <button
              onClick={endRide}
              className="w-full flex justify-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg cursor-pointer"
            >
              Finish Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishRide;

