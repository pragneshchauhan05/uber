import React from "react";

const LookingForDriver = (props) => {
  const vehicleImages = {
    car: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82ZWU1MGMxYi0yMTc0LTRjOTctODNhMS1iZmQ0NTQ0Njg5ZDAucG5n",
    motorcycle:
      "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn",
  };

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
            src={vehicleImages[props.vehicleType] || vehicleImages.car}
            alt=""
            className="h-25 object-contain"
          />
          <div className="w-full">
            <div className="flex items-center gap-5 p-3 border-b-2 border-gray-100">
              <i className="ri-map-pin-2-fill text-lg text-gray-800 shrink-0"></i>
              <div>
                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                  {props.pickup}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-5 p-3 border-b-2 border-gray-100">
              <i className="ri-map-pin-user-fill text-lg text-gray-800 shrink-0"></i>
              <div>
                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                  {props.destination}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-5 p-3">
              <i className="ri-wallet-3-fill text-lg text-gray-800 shrink-0"></i>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  ₹{props.fare?.[props.vehicleType] ?? "---"}
                </h3>
                <p className="text-sm text-gray-600">Cash</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookingForDriver;
