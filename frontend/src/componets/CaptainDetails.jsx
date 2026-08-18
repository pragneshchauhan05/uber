import React, { useContext } from "react";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainDetails = () => {
  const [captain] = useContext(CaptainDataContext);

  const firstName =
    captain?.fullname?.firstname ||
    captain?.fullName?.firstName ||
    "Captain";
  const lastName =
    captain?.fullname?.lastname ||
    captain?.fullName?.lastName ||
    "";
  const name = `${firstName} ${lastName}`.trim();

  return (
    <div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHwwx"
            alt={name}
          />
          <div>
            <h4 className="text-lg font-medium capitalize">{name}</h4>
            <p className="text-xs text-gray-500 uppercase">
              {captain?.vehicle?.plate || ""}
            </p>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-medium">₹{captain?.earnings ?? "295.20"}</h4>
          <p className="text-sm text-gray-600 text-end">Earned today</p>
        </div>
      </div>
      <div>
        <div className="flex w-full justify-around mt-7 pr-5">
          <div className="text-center">
            <i className="text-2xl font-thin ri-timer-line"></i>
            <h5 className="text-lg font-medium">{captain?.hoursOnline ?? "10.5"}</h5>
            <p className="text-sm text-gray-600">Hours Online</p>
          </div>
          <div className="text-center">
            <i className="text-2xl font-thin ri-speed-up-line"></i>
            <h5 className="text-lg font-medium">{captain?.totalDistance ?? "10.5"}</h5>
            <p className="text-sm text-gray-600">KM Driven</p>
          </div>
          <div className="text-center">
            <i className="text-2xl font-thin ri-booklet-line"></i>
            <h5 className="text-lg font-medium">{captain?.rating ?? "4.9"}</h5>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainDetails;
