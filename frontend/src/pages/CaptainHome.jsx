import React from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../componets/CaptainDetails";
import RidePopUp from "../componets/RidePopUp";
import ConfirmRidePop from "../componets/ConfirmRidePop";
import LiveTraking from "../componets/LiveTraking";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState } from "react";
import { useRef } from "react";
import { useEffect, useContext } from "react";
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

    return () => {
      socket.off("ride_request");
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
    <div className="h-screen">
      <div className="fixed p-3 top-0 flex items-center justify-between p-4 w-full z-10">
        <img className="w-16" src="/uber.png" alt="" />
      </div>
      <div className="h-3/5">
        <LiveTraking />
      </div>

      <div className="h-2/5 p-4">
        <CaptainDetails />
      </div>
      <div
        ref={ridePopUpPanelRef}
        className="fixed w-full bg-white z-10 translate-y-full bottom-0  px-3 py-6 pt-12"
      >
        <RidePopUp
          ride={ride}
          setRidePopUpPanel={setRidePopUpPanel}
          setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
        />
      </div>
      <div
        ref={confirmRidePopUpPanelRef}
        className="fixed w-full bg-white z-10 h-screen translate-y-full bottom-0  px-3 py-6 pt-12"
      >
        <ConfirmRidePop
          ride={ride}
          setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
        />
      </div>
    </div>
  );
};

export default CaptainHome;
