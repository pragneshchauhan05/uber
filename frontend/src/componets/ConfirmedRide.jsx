import React from "react";

function ConfirmedRide(props) {
  const vehicleImages = {
    car: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82ZWU1MGMxYi0yMTc0LTRjOTctODNhMS1iZmQ0NTQ0Njg5ZDAucG5n",
    motorcycle:
      "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn",
  };

  const vehicleNames = {
    car: "UberGo sedan",
    motorcycle: "Uber Moto",
    auto: "UberAuto",
  };

  return (
    <div>
      <div
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
        onClick={() => props.setConfirmedRide(false)}
      ></div>

      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Confirm Your Ride
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Review trip details before requesting
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full">
          {vehicleNames[props.vehicleType] || "UberGo"}
        </span>
      </div>

      <div className="flex justify-between flex-col items-center gap-4">
        <div className="w-full flex justify-center py-2 bg-gray-50 rounded-2xl border border-gray-100">
          <img
            src={vehicleImages[props.vehicleType] || vehicleImages.car}
            alt={props.vehicleType}
            className="h-28 object-contain drop-shadow-md"
          />
        </div>

        <div className="w-full space-y-3 pt-2">
          {/* Route Timeline */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-black rounded-full mt-1.5 shrink-0 ring-4 ring-black/10"></div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Pickup
                </p>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                  {props.pickup}
                </h4>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-gray-300 ml-1.5 pl-4 -my-1 py-1"></div>

            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-emerald-600 rounded-sm mt-1.5 shrink-0 ring-4 ring-emerald-600/10"></div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Destination
                </p>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                  {props.destination}
                </h4>
              </div>
            </div>
          </div>

          {/* Fare & Payment */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 flex items-center justify-center rounded-xl font-bold">
                <i className="ri-wallet-3-fill text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  ₹{props.fare?.[props.vehicleType] ?? "---"}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Cash Payment
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Guaranteed Fare
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            props.setVehicleFound(true);
            props.setConfirmedRide(false);
            if (props.createRide) {
              props.createRide(props.vehicleType);
            }
          }}
          className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-2xl text-base shadow-xl shadow-black/10 active:scale-[0.99] transition-all cursor-pointer flex justify-center items-center"
        >
          Confirm Ride
          <i className="ri-arrow-right-line ml-2 text-lg"></i>
        </button>
      </div>
    </div>
  );
}

export default ConfirmedRide;
