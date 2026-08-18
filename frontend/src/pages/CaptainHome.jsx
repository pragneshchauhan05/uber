import React, { useState, useRef, useEffect, useContext } from "react";
import CaptainDetails from "../componets/CaptainDetails";
import RidePopUp from "../componets/RidePopUp";
import ConfirmRidePop from "../componets/ConfirmRidePop";
import LiveTraking from "../componets/LiveTraking";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SocketContext } from "../Context/SocketContext";
import { CaptainDataContext } from "../Context/CaptainContext";

const CaptainHome = () => {
  const [ridePopUpPanel, setRidePopUpPanel] = useState(false);
  const [confirmRidePopUpPanel, setConfirmRidePopUpPanel] = useState(false);
  const [ride, setRide] = useState(null);

  const ridePopUpPanelRef = useRef(null);
  const confirmRidePopUpPanelRef = useRef(null);

  const { socket } = useContext(SocketContext);
  const [captain] = useContext(CaptainDataContext);

  useEffect(() => {
    if (captain && captain._id) {
      socket.emit("join", {
        userId: captain._id,
        userType: "captain",
      });
    }

    const updateLocation = () => {
      if (navigator.geolocation && captain?._id) {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        });
      }
    };

    const updateLocationInterval = setInterval(updateLocation, 10000);
    updateLocation();

    return () => clearInterval(updateLocationInterval);
  }, [captain, socket]);

  useEffect(() => {
    socket.on("ride_request", (data) => {
      console.log("Ride request received", data);
      setRide(data);
      setRidePopUpPanel(true);
      setConfirmRidePopUpPanel(false);
    });

    socket.on("ride-cancelled", () => {
      setRidePopUpPanel(false);
      setConfirmRidePopUpPanel(false);
      setRide(null);
    });

    return () => {
      socket.off("ride_request");
      socket.off("ride-cancelled");
    };
  }, [socket]);


  useGSAP(
    function () {
      if (ridePopUpPanel) {
        gsap.to(ridePopUpPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(ridePopUpPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [ridePopUpPanel],
  );

  useGSAP(
    function () {
      if (confirmRidePopUpPanel) {
        gsap.to(confirmRidePopUpPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopUpPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopUpPanel],
  );

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col bg-white">
        {/* Top Header */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
          <img
            className="w-16 drop-shadow-md pointer-events-auto"
            src="/uber.png"
            alt="Uber"
          />
          <div className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg pointer-events-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            Online & Ready
          </div>
        </div>

        {/* Live Map */}
        <div className="h-[60%] w-full relative">
          <LiveTraking />
        </div>

        {/* Driver Dashboard Panel */}
        <div className="h-[40%] bg-white p-6 rounded-t-3xl shadow-2xl -mt-6 z-10 border-t border-gray-100 flex flex-col justify-between">
          <CaptainDetails />
        </div>

        {/* Ride Request Sheet */}
        <div
          ref={ridePopUpPanelRef}
          className="fixed md:absolute w-full max-w-md bg-white z-30 translate-y-full bottom-0 px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100"
        >
          <RidePopUp
            ride={ride}
            setRidePopUpPanel={setRidePopUpPanel}
            setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
          />
        </div>

        {/* Confirm OTP Sheet */}
        <div
          ref={confirmRidePopUpPanelRef}
          className="fixed md:absolute w-full max-w-md bg-white z-30 translate-y-full bottom-0 px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100 max-h-screen overflow-y-auto"
        >
          <ConfirmRidePop
            ride={ride}
            setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
          />
        </div>
      </div>
    </div>
  );
};

export default CaptainHome;
