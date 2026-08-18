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
  const rideData = location.state?.ride;

  const distanceKm = rideData?.distance
    ? typeof rideData.distance === "number"
      ? (rideData.distance / 1000).toFixed(1) + " km away"
      : rideData.distance + " away"
    : "4 km away";

  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [finishRidePanel],
  );

  return (
    <div className="h-screen relative">
      <h5
        onClick={() => {
          setFinishRidePanel(true);
        }}
        className="p-1 text-center w-full bottom-[15%] absolute z-10 cursor-pointer"
      >
        <i className="text-3xl text-white ri-arrow-up-wide-line"></i>
      </h5>
      <div className="fixed p-3 top-0 flex items-center justify-between p-4 w-full z-10">
        <img className="w-16" src="/uber.png" alt="" />
        <Link
          to="/captain-home"
          className=" h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="font-medium text-lg ri-home-5-line"></i>
        </Link>
      </div>
      <div className="h-4/5">
        <LiveTraking />
      </div>


      <div className="h-1/5 p-6 flex items-center justify-between bg-black/87">
        <h4 className="text-xl font-semibold text-white">{distanceKm}</h4>
        <button
          onClick={() => {
            setFinishRidePanel(true);
          }}
          className="bg-white text-black font-semibold p-2 px-12 rounded-lg cursor-pointer"
        >
          Complete Ride
        </button>
      </div>
      <div
        ref={finishRidePanelRef}
        className="fixed w-full bg-white z-10 h-[79%] translate-y-full bottom-0 px-3 py-6 pt-12 rounded-t-3xl"
      >
        <FinishRide
          ride={rideData}
          setFinishRidePanel={setFinishRidePanel}
        />
      </div>
    </div>
  );
};

export default CaptainRiding;

