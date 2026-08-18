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

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] top-0 absolute cursor-pointer"
        onClick={() => {
          props.setVehiclePanelOpen(false);
        }}
      >
        <i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-xl font-semibold mb-5">Choose a Vehicle</h3>
      <div
        onClick={() => {
          props.setVehicleType && props.setVehicleType("car");
          props.setConfirmedRide(true);
        }}
        className="flex border-2 active:border-black border-gray-300 mb-2 rounded-xl p-3 w-full items-center justify-between cursor-pointer"
      >
        <img
          className="h-14"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy82ZWU1MGMxYi0yMTc0LTRjOTctODNhMS1iZmQ0NTQ0Njg5ZDAucG5n"
          alt=""
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-sm">
            UberGo{" "}
            <span>
              <i className="ri-user-fill"></i> 4
            </span>
          </h4>
          <h5 className="font-medium text-sm">
            {get12HourTime(props.fare?.durationMinutes?.car || 2)}
          </h5>
          <p className="font-normal text-xs text-gray-600">
            Affordable, compact rides
          </p>
        </div>
        <h2 className="text-xl font-semibold">₹{props.fare?.car ?? "---"}</h2>
      </div>
      <div
        onClick={() => {
          props.setVehicleType && props.setVehicleType("motorcycle");
          props.setConfirmedRide(true);
        }}
        className="flex border-2 active:border-black border-gray-300 mb-2 rounded-xl p-3 w-full items-center justify-between cursor-pointer"
      >
        <img
          className="h-14"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n"
          alt=""
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-sm">
            Moto{" "}
            <span>
              <i className="ri-user-fill"></i> 1
            </span>
          </h4>
          <h5 className="font-medium text-sm">
            {get12HourTime(props.fare?.durationMinutes?.motorcycle || 3)}
          </h5>
          <p className="font-normal text-xs text-gray-600">
            Affordable, Motorcycle ride
          </p>
        </div>
        <h2 className="text-xl font-semibold">
          ₹{props.fare?.motorcycle ?? "---"}
        </h2>
      </div>
      <div
        onClick={() => {
          props.setVehicleType && props.setVehicleType("auto");
          props.setConfirmedRide(true);
        }}
        className="flex border-2 active:border-black border-gray-300 mb-2 rounded-xl p-3 w-full items-center justify-between cursor-pointer"
      >
        <img
          className="ml-6 h-14"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn"
          alt=""
        />
        <div className="ml-6 w-1/2">
          <h4 className="font-medium text-sm">
            UberAuto{" "}
            <span>
              <i className="ri-user-fill"></i> 3
            </span>
          </h4>
          <h5 className="font-medium text-sm">
            {get12HourTime(props.fare?.durationMinutes?.auto || 5)}
          </h5>
          <p className="font-normal text-xs text-gray-600">
            Affordable, Auto ride
          </p>
        </div>
        <h2 className="text-xl font-semibold">₹{props.fare?.auto ?? "---"}</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;
