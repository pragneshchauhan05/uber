import React from "react";

const WaitingForDriver = (props) => {
  const captainFirstName = props.ride?.captain?.fullname?.firstname || "Captain";
  const captainLastName = props.ride?.captain?.fullname?.lastname || "";
  const captainName = `${captainFirstName} ${captainLastName}`.trim();

  const vehiclePlate = props.ride?.captain?.vehicle?.plate || "GJ 38 AB 5113";
  const vehicleType = props.ride?.captain?.vehicle?.vehicleType || "Car";
  const vehicleColor = props.ride?.captain?.vehicle?.color || "";
  const vehicleInfo = `${vehicleColor} ${vehicleType}`.trim();

  return (
    <div>
      <div>
        <h5
          className="p-1 text-center w-[93%] top-0 absolute cursor-pointer"
          onClick={() => {
            props.setWaitingForDriver(false);
          }}
        >
          <i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i>
        </h5>

        <div className="flex items-center justify-between mb-5">
          <img
            src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n"
            alt=""
            className="h-20"
          />
          <div className="text-right">
            <h2 className="text-lg font-medium capitalize">{captainName}</h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">{vehiclePlate}</h4>
            <p className="text-sm text-gray-600 capitalize">{vehicleInfo}</p>
            <h1 className="text-lg font-bold text-gray-800 bg-gray-200 px-3 py-1 rounded-lg mt-2 inline-block">
              OTP: {props.ride?.otp || "----"}
            </h1>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;

