import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CaptainDetails from "../componets/CaptainDetails";
import RidePopUp from "../componets/RidePopUp";
import ConfirmRidePop from "../componets/ConfirmRidePop";
import LiveTraking from "../componets/LiveTraking";
import RealtimeNotificationModal from "../componets/RealtimeNotificationModal";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SocketContext } from "../Context/SocketContext";
import { CaptainDataContext } from "../Context/CaptainContext";
import { getApiBaseUrl } from "../config";

const CaptainHome = () => {
  const navigate = useNavigate();
  const [ridePopUpPanel, setRidePopUpPanel] = useState(false);
  const [confirmRidePopUpPanel, setConfirmRidePopUpPanel] = useState(false);
  const [ride, setRide] = useState(null);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  const ridePopUpPanelRef = useRef(null);
  const confirmRidePopUpPanelRef = useRef(null);

  const { socket, sendMessage } = useContext(SocketContext);
  const [captain, setCaptain] = useContext(CaptainDataContext);

  useEffect(() => {
    const token = localStorage.getItem("captainToken");
    if (token) {
      axios
        .get(`${getApiBaseUrl()}/captains/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data?.captain) {
            setCaptain(res.data.captain);
          }
        })
        .catch((err) => console.error("Error fetching captain profile:", err));
    }
  }, [setCaptain]);

  useEffect(() => {
    if (captain && captain._id && socket) {
      sendMessage("join", { userType: "captain", userId: captain._id });
    }
  }, [captain, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleRideMatched = (data) => {
      console.log("Real-time ride:matched notification:", data);
      setRealtimeNotification({ type: "ride:matched", data });
    };

    const handleRideRequested = (data) => {
      console.log("Real-time ride:requested notification:", data);
      setRealtimeNotification({ type: "ride:requested", data });
    };

    socket.on("ride:matched", handleRideMatched);
    socket.on("ride:requested", handleRideRequested);

    return () => {
      socket.off("ride:matched", handleRideMatched);
      socket.off("ride:requested", handleRideRequested);
    };
  }, [socket]);

  useEffect(() => {
    if (!ridePopUpPanel && !confirmRidePopUpPanel) return;

    const handlePopState = () => {
      if (confirmRidePopUpPanel) {
        setConfirmRidePopUpPanel(false);
        setRidePopUpPanel(true);
      } else if (ridePopUpPanel) {
        setRidePopUpPanel(false);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [ridePopUpPanel, confirmRidePopUpPanel]);

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
  }, [captain?._id, socket]);

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
      if (ridePopUpPanelRef.current) {
        gsap.to(ridePopUpPanelRef.current, {
          y: ridePopUpPanel ? "0%" : "100%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    [ridePopUpPanel],
  );

  useGSAP(
    function () {
      if (confirmRidePopUpPanelRef.current) {
        gsap.to(confirmRidePopUpPanelRef.current, {
          y: confirmRidePopUpPanel ? "0%" : "100%",
          duration: 0.4,
          ease: "power3.inOut",
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
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              Online
            </div>
            <Link
              to="/captain-logout"
              title="Logout"
              className="h-9 w-9 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-gray-800 hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              <i className="ri-logout-box-r-line text-base"></i>
            </Link>
          </div>
        </div>

        {/* Live Map */}
        <div className="h-[60%] w-full relative">
          <LiveTraking />
        </div>

        {/* Driver Dashboard Panel */}
        <div className="h-[40%] bg-white p-5 rounded-t-3xl shadow-2xl -mt-6 z-10 border-t border-gray-100 flex flex-col justify-between">
          <CaptainDetails />

          <Link
            to="/captain/create-route"
            title="Publish Planned Route"
            className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 flex justify-center items-center cursor-pointer transition-all gap-2 mt-3 shrink-0"
          >
            <i className="ri-map-pin-add-line text-lg text-emerald-400"></i>
            <span>Create Route</span>
          </Link>
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
        {/* Real-time Socket Notification Modal */}
        <RealtimeNotificationModal
          notification={realtimeNotification}
          onClose={() => setRealtimeNotification(null)}
          onViewRide={() => navigate("/captain/create-route")}
        />
      </div>
    </div>
  );
};

export default CaptainHome;
