import React, { useState } from "react";
import { Link } from "react-router-dom";

const ConfirmRidePop = (props) => {
  const [otp, setOtp] = useState("");
  const submitHandler = (e) => {
    e.preventDafault;
  };
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
              alt=""
            />
            <h2 className="text-xl font-semibold">Harsh Patel</h2>
          </div>
          <h5 className="text-lg font-semibold">2.2km</h5>
        </div>
        <div className="flex justify-between flex-col items-center gap-5">
          <div className="w-full">
            <div className="flex item-center gap-5 p-3  ">
              <i className=" ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">103,Amrut flet</h3>
                <p className="text-sm text-gray-600 -m-1">
                  New triveni SCO. katargam Surat
                </p>
              </div>
            </div>
            <div className="flex item-center gap-5 p-3  mt-3 ">
              <i className="ri-map-pin-user-fill"></i>
              <div>
                <h3 className="text-lg font-medium">103,Amrut flet</h3>
                <p className="text-sm text-gray-600 -m-1">
                  New triveni SCO. katargam Surat
                </p>
              </div>
            </div>
            <div className="flex item-center gap-5 p-3 mt-3 ">
              <i className="ri-wallet-3-fill"></i>
              <div>
                <h3 className="text-lg font-medium">₹193.15</h3>
                <p className="text-sm text-gray-600 -m-1">Cash Cash</p>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full">
            <form
              onSubmit={(e) => {
                submitHandler(e);
              }}
            >
              <input
                type="text"
                placeholder="Enter OTP"
                className="bg-[#eee] px-6 py-2 font-moto text-lg rounded-lg w-full mt-3"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
              />
              <Link
                to={"/captain-riding"}
                className="w-full flex justify-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg"
              >
                Confirm
              </Link>
              <button
                onClick={() => {
                  props.setConfirmRidePopUpPanel(false);
                }}
                className="w-full mt-3 bg-red-500 text-white font-semibold p-2 rounded-lg"
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
