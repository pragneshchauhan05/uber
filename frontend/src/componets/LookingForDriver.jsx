import React from "react";

const formatPrice = (val) => {
  if (val === undefined || val === null || val === "---") return "---";
  const num = Number(val);
  return isNaN(num) ? "---" : num.toLocaleString("en-IN");
};

const LookingForDriver = (props) => {
  const vehicleImages = {
    car: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82ZWU1MGMxYi0yMTc0LTRjOTctODNhMS1iZmQ0NTQ0Njg5ZDAucG5n",
    motorcycle:
      "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn",
  };

  return (
    <div>
      <div
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
        onClick={() => props.setVehicleFound(false)}
      ></div>

      <div className="text-center mb-6">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center mb-3">
          <div className="absolute inset-0 bg-black/10 rounded-full animate-ping"></div>
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center z-10 shadow-lg">
            <i className="ri-radar-line text-2xl animate-spin"></i>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
          Looking for Nearby Drivers
        </h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Connecting with the closest available captain
        </p>
      </div>

      <div className="flex justify-between flex-col items-center gap-4">
        <div className="w-full flex justify-center py-2 bg-gray-50 rounded-2xl border border-gray-100">
          <img
            src={vehicleImages[props.vehicleType] || vehicleImages.car}
            alt={props.vehicleType}
            className="h-24 object-contain drop-shadow-md"
          />
        </div>

        <div className="w-full space-y-3">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
              <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">
                {props.pickup}
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></div>
              <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">
                {props.destination}
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              Estimated Fare
            </span>
            <span className="text-base font-extrabold text-gray-900">
              ₹{formatPrice(props.fare?.[props.vehicleType])}
            </span>
          </div>
        </div>

        <button
          onClick={() => props.setVehicleFound(false)}
          className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 rounded-2xl text-sm transition-all cursor-pointer"
        >
          Cancel Request
        </button>
      </div>
    </div>
  );
};

export default LookingForDriver;
