import React, { useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../Context/SocketContext";
import { UserDataContext } from "../Context/UserContext";
import LiveTraking from "../componets/LiveTraking";

function Riding() {
  const location = useLocation();
  const ride = location.state?.ride;
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [user] = useContext(UserDataContext);

  useEffect(() => {
    if (user && user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }
  }, [user, socket]);

  useEffect(() => {
    socket.on("ride-ended", () => {
      navigate("/home");
    });

    return () => {
      socket.off("ride-ended");
    };
  }, [socket, navigate]);

  const captainFirstName = ride?.captain?.fullname?.firstname || "Captain";
  const captainLastName = ride?.captain?.fullname?.lastname || "";
  const captainName = `${captainFirstName} ${captainLastName}`.trim();

  const vehiclePlate = ride?.captain?.vehicle?.plate || "GJ 38 AB 5113";
  const vehicleType = ride?.captain?.vehicle?.vehicleType || "Car";
  const vehicleColor = ride?.captain?.vehicle?.color || "";
  const vehicleInfo = `${vehicleColor} ${vehicleType}`.trim();


  return (
    <div className="h-screen">
      <Link
        to="/home"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10"
      >
        <i className="font-medium text-lg ri-home-5-line"></i>
      </Link>
      <div className="h-1/2">
        <LiveTraking />
      </div>

      <div className="h-1/2 p-4">
        <div className="flex justify-between flex-col items-center gap-5">
          <div className="flex items-center justify-between w-full">
            <img
              src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n"
              alt=""
              className="h-20"
            />
            <div className="text-right">
              <h2 className="text-lg font-medium capitalize">{captainName}</h2>
              <h4 className="text-xl font-semibold -mt-1 -mb-1">{vehiclePlate}</h4>
              <p className="text-sm text-gray-600 capitalize">{vehicleInfo}</p>
            </div>
          </div>
          <div className="w-full">
            <div className="flex item-center gap-5 p-3 mt-3">
              <i className="ri-map-pin-user-fill"></i>
              <div>
                <h3 className="text-lg font-medium">
                  {ride?.destination
                    ? ride.destination.split(",")[0]
                    : "Destination Location"}
                </h3>
                <p className="text-sm text-gray-600 -m-1">
                  {ride?.destination || ""}
                </p>
              </div>
            </div>
            <div className="flex item-center gap-5 p-3 mt-3">
              <i className="ri-wallet-3-fill"></i>
              <div>
                <h3 className="text-lg font-medium">₹{ride?.fare ?? "0"}</h3>
                <p className="text-sm text-gray-600 -m-1">Cash</p>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full mt-6 bg-green-600 text-white font-semibold p-2 rounded-lg cursor-pointer">
          Make a Payment
        </button>
      </div>
    </div>
  );
}

export default Riding;

