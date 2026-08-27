import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from "../componets/FinishRide";
import LiveTraking from "../componets/LiveTraking";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const passedRide = location.state?.ride;

  if (passedRide) {
    sessionStorage.setItem("captainActiveRide", JSON.stringify(passedRide));
  }

  const rideData =
    passedRide ||
    JSON.parse(sessionStorage.getItem("captainActiveRide") || "null");

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

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col bg-white">
        {/* Floating Top Bar */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-black/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            On Route to Dropoff
          </div>
          <Link
            to="/captain-home"
            className="h-10 w-10 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-gray-800 hover:bg-white transition-all pointer-events-auto"
          >
            <i className="ri-home-5-line text-lg"></i>
          </Link>
        </div>

        {/* Live Map */}
        <div className="h-[75%] w-full relative">
          <LiveTraking />
        </div>

        {/* Bottom Trip Action Bar */}
        <div className="h-[25%] bg-black text-white p-6 rounded-t-3xl shadow-2xl -mt-6 z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Distance
            </p>
            <h4 className="text-xl font-extrabold text-white mt-0.5">
              {distanceKm}
            </h4>
          </div>
          <button
            onClick={() => {
              setFinishRidePanel(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transition-all duration-200 text-black font-extrabold py-3.5 px-8 rounded-2xl text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Complete Ride
          </button>
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
