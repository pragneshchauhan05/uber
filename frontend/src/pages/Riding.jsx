import React from "react";
import { Link } from "react-router-dom";

function Riding() {
  return (
    <div className="h-screen">
      <Link
        to="/home"
        className="fixed  right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full"
      >
        <i className="font-medium text-lg ri-home-5-line"></i>
      </Link>
      <div className="h-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://s3-eu-west-1.amazonaws.com/adminjs-blog/2023/05/0_HzyjQ7h0baWklQeF.webp"
          alt=""
        />
      </div>

      <div className="h-1/2 p-4">
        <div className="flex justify-between flex-col items-center gap-5">
          <div className="flex">
            <img
              src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n"
              alt=""
              className="h-25"
            />
            <div className="flex-col justify-start ml-12 item-start">
              <h3 className="text-xl font-semibold">Pragnesh</h3>
              <h3 className="text-sm text-gray-600">GJ 38 AB 5113</h3>
              <h3 className="text-sm text-gray-600">Maruti Suzuki Baleno</h3>
            </div>
          </div>
          <div className="w-full">
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
        </div>
        <button className="w-full mt-6 bg-green-600 text-white font-semibold p-2 rounded-lg">
          Make a Payment
        </button>
      </div>
    </div>
  );
}

export default Riding;
