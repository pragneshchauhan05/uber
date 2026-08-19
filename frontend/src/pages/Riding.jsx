import React, { useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../Context/SocketContext";
import { UserDataContext } from "../Context/UserContext";
import LiveTraking from "../componets/LiveTraking";

function Riding() {
  const location = useLocation();
  const passedRide = location.state?.ride;

  if (passedRide) {
    sessionStorage.setItem("activeRide", JSON.stringify(passedRide));
  }

  const ride = passedRide || JSON.parse(sessionStorage.getItem("activeRide") || "null");
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
      sessionStorage.removeItem("activeRide");
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
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col bg-white">
        {/* Floating Top Controls */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-black/90 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            Trip in Progress
          </div>
          <Link
            to="/home"
            className="h-10 w-10 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-gray-800 hover:bg-white transition-all pointer-events-auto"
          >
            <i className="ri-home-5-line text-lg"></i>
          </Link>
        </div>

        {/* Live Map Portion */}
        <div className="h-[55%] w-full relative">
          <LiveTraking />
        </div>

        {/* Riding Info Bottom Sheet */}
        <div className="h-[45%] bg-white p-6 rounded-t-3xl shadow-2xl -mt-6 z-10 flex flex-col justify-between border-t border-gray-100">
          <div>
            {/* Driver Profile Summary */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                    alt={captainName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 capitalize leading-tight">
                    {captainName}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <i className="ri-star-fill text-amber-500 text-xs"></i>
                    <span className="text-xs font-bold text-gray-700">4.9</span>
                    <span className="text-xs text-gray-400">
                      • {vehicleInfo}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">
                  {vehiclePlate}
                </h4>
              </div>
            </div>

            {/* Destination & Payment Details */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <i className="ri-map-pin-2-fill text-lg"></i>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Heading To
                  </p>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                    {ride?.destination || "Destination"}
                  </h4>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <i className="ri-wallet-3-fill text-emerald-600 text-lg"></i>
                  <span className="text-xs font-semibold text-gray-600">
                    Total Trip Fare
                  </span>
                </div>
                <span className="text-base font-extrabold text-gray-900">
                  ₹{ride?.fare ?? "0"}
                </span>
              </div>
            </div>
          </div>

          <button className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all duration-200 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg shadow-emerald-600/20 cursor-pointer flex justify-center items-center">
            <i className="ri-bank-card-fill mr-2 text-lg"></i>
            Make a Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default Riding;
