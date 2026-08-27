import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from "../componets/FinishRide";
import LiveTraking from "../componets/LiveTraking";
import axios from "axios";
import { getApiBaseUrl } from "../config";
import { SocketContext } from "../Context/SocketContext";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  const passedRide = location.state?.ride;

  if (passedRide) {
    sessionStorage.setItem("captainActiveRide", JSON.stringify(passedRide));
  }

  const rideData =
    passedRide ||
    JSON.parse(sessionStorage.getItem("captainActiveRide") || "null");

  const [pickupCoords, setPickupCoords] = useState(rideData?.pickupCoords || null);
  const [dropCoords, setDropCoords] = useState(rideData?.dropCoords || null);
  const [captainCoords, setCaptainCoords] = useState(() => {
    if (rideData?.captain?.location) {
      const lat = Number(rideData.captain.location.lat || rideData.captain.location.ltd);
      const lng = Number(rideData.captain.location.lng);
      if (lat && lng) return { lat, lng };
    }
    return null;
  });

  useEffect(() => {
    const geocodeIfNeeded = async () => {
      const token = localStorage.getItem("captainToken");
      if (!pickupCoords && rideData?.pickup) {
        try {
          const res = await axios.get(`${getApiBaseUrl()}/maps/get-coordinates`, {
            params: { address: rideData.pickup },
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

      if (!dropCoords && rideData?.destination) {
        try {
          const res = await axios.get(`${getApiBaseUrl()}/maps/get-coordinates`, {
            params: { address: rideData.destination },
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
  }, [rideData]);

  // Track captain's real-time position using browser geolocation and relay via socket
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCaptainCoords({ lat, lng });

          const captainId =
            rideData?.captain?._id ||
            rideData?.captain ||
            (typeof rideData?.captain === "string" ? rideData.captain : null);

          if (captainId && socket) {
            socket.emit("update-location-captain", {
              userId: captainId,
              location: {
                ltd: lat,
                lng: lng,
              },
            });
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [rideData, socket]);

  const distanceKm = rideData?.distance
    ? typeof rideData.distance === "number"
      ? (rideData.distance / 1000).toFixed(1) + " km remaining"
      : rideData.distance + " remaining"
    : "4.0 km remaining";

  useGSAP(
    function () {
      if (finishRidePanelRef.current) {
        gsap.to(finishRidePanelRef.current, {
          y: finishRidePanel ? "0%" : "100%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    [finishRidePanel],
  );

  const startNavigation = () => {
    let destinationQuery = "";
    if (dropCoords?.lat && dropCoords?.lng) {
      destinationQuery = `${dropCoords.lat},${dropCoords.lng}`;
    } else if (rideData?.destination) {
      destinationQuery = encodeURIComponent(rideData.destination);
    } else {
      destinationQuery = "Destination";
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative bg-black">
        {/* Floating Top Bar */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-gray-800 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            On Route to Dropoff
          </div>
          <Link
            to="/captain-home"
            className="h-10 w-10 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-black hover:bg-white transition-all pointer-events-auto"
          >
            <i className="ri-home-5-line text-lg"></i>
          </Link>
        </div>

        {/* Full-bleed Live Map Background */}
        <div className="h-full w-full absolute inset-0 z-0">
          <LiveTraking
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            captainCoords={captainCoords}
          />
        </div>

        {/* Bottom-anchored Trip Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 w-full bg-black text-white p-5 rounded-t-3xl shadow-2xl z-20 space-y-3 border-t border-gray-800">
          <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-1"></div>

          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                DISTANCE
              </p>
              <h4 className="text-lg font-extrabold text-white">
                {distanceKm}
              </h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                HEADING TO
              </p>
              <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                {rideData?.destination || "Destination"}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={startNavigation}
              className="bg-white hover:bg-gray-200 active:scale-[0.99] transition-all duration-200 text-black font-extrabold py-3.5 px-3 rounded-2xl text-xs md:text-sm shadow-lg cursor-pointer flex justify-center items-center gap-2"
            >
              <i className="ri-navigation-fill text-base text-black"></i>
              <span>Start Navigation</span>
            </button>

            <button
              onClick={() => {
                setFinishRidePanel(true);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:scale-[0.99] transition-all duration-200 text-white font-extrabold py-3.5 px-3 rounded-2xl text-xs md:text-sm shadow-lg cursor-pointer flex justify-center items-center gap-1.5"
            >
              <i className="ri-checkbox-circle-fill text-base text-white"></i>
              <span>Complete Ride</span>
            </button>
          </div>
        </div>

        {/* Finish Ride Sheet */}
        <div
          ref={finishRidePanelRef}
          className="fixed md:absolute w-full max-w-md bg-white z-30 translate-y-full bottom-0 px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100 max-h-screen overflow-y-auto"
        >
          <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
        </div>
      </div>
    </div>
  );
};

export default CaptainRiding;
