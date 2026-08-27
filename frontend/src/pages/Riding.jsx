import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../Context/SocketContext";
import { UserDataContext } from "../Context/UserContext";
import LiveTraking from "../componets/LiveTraking";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const formatPrice = (val) => {
  if (val === undefined || val === null || val === "---") return "0";
  const num = Number(val);
  return isNaN(num) ? "0" : num.toLocaleString("en-IN");
};

function Riding() {
  const location = useLocation();
  const passedRide = location.state?.ride;

  if (passedRide) {
    sessionStorage.setItem("activeRide", JSON.stringify(passedRide));
  }

  const ride =
    passedRide || JSON.parse(sessionStorage.getItem("activeRide") || "null");
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [user] = useContext(UserDataContext);

  const [captainCoords, setCaptainCoords] = useState(() => {
    if (ride?.captain?.location) {
      const lat = Number(ride.captain.location.lat || ride.captain.location.ltd);
      const lng = Number(ride.captain.location.lng);
      if (lat && lng) return { lat, lng };
    }
    return null;
  });

  const [pickupCoords, setPickupCoords] = useState(ride?.pickupCoords || null);
  const [dropCoords, setDropCoords] = useState(ride?.dropCoords || null);

  useEffect(() => {
    if (user && user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }
  }, [user, socket]);

  // Geocode pickup / destination if coordinates are missing
  useEffect(() => {
    const geocodeIfNeeded = async () => {
      const token = localStorage.getItem("token");
      if (!pickupCoords && ride?.pickup) {
        try {
          const res = await axios.get(`${getApiBaseUrl()}/maps/get-coordinates`, {
            params: { address: ride.pickup },
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.ltd || res.data?.lat) {
            setPickupCoords({
              lat: Number(res.data.ltd || res.data.lat),
              lng: Number(res.data.lng),
            });
          }
        } catch (e) {}
      }

      if (!dropCoords && ride?.destination) {
        try {
          const res = await axios.get(`${getApiBaseUrl()}/maps/get-coordinates`, {
            params: { address: ride.destination },
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.ltd || res.data?.lat) {
            setDropCoords({
              lat: Number(res.data.ltd || res.data.lat),
              lng: Number(res.data.lng),
            });
          }
        } catch (e) {}
      }
    };

    geocodeIfNeeded();
  }, [ride]);

  // Socket listener for real-time captain movement
  useEffect(() => {
    const handleCaptainLocation = (data) => {
      if (data?.location) {
        const cLat = Number(data.location.lat || data.location.ltd);
        const cLng = Number(data.location.lng);
        if (cLat && cLng) {
          setCaptainCoords({ lat: cLat, lng: cLng });
        }
      }
    };

    socket.on("captain-location-updated", handleCaptainLocation);
    socket.on("ride-ended", () => {
      sessionStorage.removeItem("activeRide");
      sessionStorage.removeItem("home_pickup");
      sessionStorage.removeItem("home_destination");
      sessionStorage.removeItem("home_vehiclePanelOpen");
      sessionStorage.removeItem("home_confirmedRide");
      sessionStorage.removeItem("home_vehicleFound");
      sessionStorage.removeItem("home_waitingForDriver");
      sessionStorage.removeItem("home_fare");
      sessionStorage.removeItem("home_vehicleType");
      sessionStorage.removeItem("home_ride");
      navigate("/home", { replace: true, state: { resetPanels: true } });
    });

    return () => {
      socket.off("captain-location-updated", handleCaptainLocation);
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
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative bg-white">
        {/* Floating Top Controls */}
        <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between pointer-events-none">
          <div className="bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-gray-800 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            Trip in Progress
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <Link
              to="/home"
              title="Home"
              className="h-9 w-9 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-black hover:bg-white transition-all cursor-pointer"
            >
              <i className="ri-home-5-line text-base"></i>
            </Link>
            <Link
              to="/logout"
              title="Logout"
              className="h-9 w-9 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-black hover:bg-white transition-all cursor-pointer"
            >
              <i className="ri-logout-box-r-line text-base"></i>
            </Link>
          </div>
        </div>

        {/* Full-bleed Live Map Background */}
        <div className="h-full w-full absolute inset-0 z-0">
          <LiveTraking
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            captainCoords={captainCoords}
          />
        </div>

        {/* Bottom-anchored Riding Info Sheet */}
        <div className="absolute bottom-0 left-0 right-0 w-full bg-white p-5 md:p-6 rounded-t-3xl shadow-2xl z-20 border-t border-gray-100 space-y-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>

          {/* Driver Profile Summary */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                  alt={captainName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 uppercase leading-tight">
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
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {vehiclePlate}
              </h4>
            </div>
          </div>

          {/* Destination & Payment Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center shrink-0">
                <i className="ri-map-pin-2-fill text-lg"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  HEADING TO
                </p>
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {ride?.destination || "Destination"}
                </h4>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                  <i className="ri-wallet-3-fill text-base"></i>
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  Total Trip Fare
                </span>
              </div>
              <span className="text-base font-extrabold text-gray-900">
                ₹{formatPrice(ride?.fare)}
              </span>
            </div>
          </div>

          <button className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg cursor-pointer flex justify-center items-center gap-2">
            <i className="ri-bank-card-fill text-xl"></i>
            <span>Make a Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Riding;
