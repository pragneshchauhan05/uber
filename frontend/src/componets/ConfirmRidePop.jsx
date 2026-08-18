import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ConfirmRidePop = (props) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

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
      alert(err.response?.data?.message || "Invalid OTP");
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

  return (
    <div>
      <div>
        <h5
          className="p-1 text-center w-[93%] top-0 absolute cursor-pointer"
          onClick={() => {
            props.setConfirmRidePopUpPanel(false);
          }}
        >
          <i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className="text-xl font-semibold mb-5">
          Confirm This Ride To Start
        </h3>
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
            <form onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Enter OTP"
                className="bg-[#eee] px-6 py-2 font-mono text-lg rounded-lg w-full mt-3"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
              />
              <button
                type="submit"
                className="w-full flex justify-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => {
                  props.setConfirmRidePopUpPanel(false);
                }}
                className="w-full mt-3 bg-red-500 text-white font-semibold p-2 rounded-lg text-center cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRidePop;

