import React from "react";

const LookingForDriver = (props) => {
  return (
    <div>
      <div>
        <h5
          className="p-1 text-center w-[93%] top-0 absolute cursor-pointer"
          onClick={() => {
            props.setVehicleFound(false);
          }}
        >
          <i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className="text-xl font-semibold mb-5">Looking for a Driver</h3>
        <div className="flex justify-between flex-col items-center gap-5">
          <img
            src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n"
            alt=""
            className="h-25"
          />
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
        </div>
      </div>
    </div>
  );
};

export default LookingForDriver;
