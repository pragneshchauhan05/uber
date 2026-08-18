import React from "react";

const VehiclePanel = (props) => {
  const get12HourTime = (minutesToAdd = 0) => {
    const date = new Date(Date.now() + minutesToAdd * 60 * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleSelectVehicle = (type) => {
    if (props.setVehicleType) {
      props.setVehicleType(type);
    }
    props.setConfirmedRide(true);
  };

  return (
    <div>
      <div
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
        onClick={() => props.setVehiclePanelOpen(false)}
      ></div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
          Choose a Ride
        </h3>
        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
          {props.fare?.distance || "Nearby"}
        </span>
      </div>

      {/* UberGo (Car) */}
      <div
        onClick={() => handleSelectVehicle("car")}
        className="flex border-2 border-gray-200 hover:border-black active:scale-[0.99] transition-all duration-200 mb-3 rounded-2xl p-4 w-full items-center justify-between cursor-pointer bg-white shadow-sm hover:shadow-md"
      >
        <img
          className="h-16 w-20 object-contain"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82ZWU1MGMxYi0yMTc0LTRjOTctODNhMS1iZmQ0NTQ0Njg5ZDAucG5n"
          alt="UberGo"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-gray-900">UberGo</h4>
            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="ri-user-3-fill text-gray-700"></i> 4
            </span>
          </div>
          <h5 className="font-semibold text-xs text-emerald-600 mt-0.5">
            {get12HourTime(props.fare?.durationMinutes?.car || 2)} •{" "}
            {props.fare?.durationTimes?.car || "2 min away"}
          </h5>
          <p className="text-xs text-gray-500 mt-0.5">
            Affordable, comfortable rides
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-extrabold text-gray-900">
            ₹{props.fare?.car ?? "---"}
          </h2>
        </div>
      </div>

      {/* Moto (Motorcycle) */}
      <div
        onClick={() => handleSelectVehicle("motorcycle")}
        className="flex border-2 border-gray-200 hover:border-black active:scale-[0.99] transition-all duration-200 mb-3 rounded-2xl p-4 w-full items-center justify-between cursor-pointer bg-white shadow-sm hover:shadow-md"
      >
        <img
          className="h-16 w-20 object-contain"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n"
          alt="Moto"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-gray-900">Moto</h4>
            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="ri-user-3-fill text-gray-700"></i> 1
            </span>
          </div>
          <h5 className="font-semibold text-xs text-emerald-600 mt-0.5">
            {get12HourTime(props.fare?.durationMinutes?.motorcycle || 3)} •{" "}
            {props.fare?.durationTimes?.motorcycle || "3 min away"}
          </h5>
          <p className="text-xs text-gray-500 mt-0.5">Quick motorcycle rides</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-extrabold text-gray-900">
            ₹{props.fare?.motorcycle ?? "---"}
          </h2>
        </div>
      </div>

      {/* UberAuto (Auto) */}
      <div
        onClick={() => handleSelectVehicle("auto")}
        className="flex border-2 border-gray-200 hover:border-black active:scale-[0.99] transition-all duration-200 mb-2 rounded-2xl p-4 w-full items-center justify-between cursor-pointer bg-white shadow-sm hover:shadow-md"
      >
        <img
          className="h-16 w-20 object-contain"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn"
          alt="UberAuto"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-gray-900">UberAuto</h4>
            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="ri-user-3-fill text-gray-700"></i> 3
            </span>
          </div>
          <h5 className="font-semibold text-xs text-emerald-600 mt-0.5">
            {get12HourTime(props.fare?.durationMinutes?.auto || 5)} •{" "}
            {props.fare?.durationTimes?.auto || "5 min away"}
          </h5>
          <p className="text-xs text-gray-500 mt-0.5">
            No bargaining, auto rides
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-extrabold text-gray-900">
            ₹{props.fare?.auto ?? "---"}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel;
