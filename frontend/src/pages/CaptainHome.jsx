import React from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../componets/Captaindetails";
import RidePopUp from "../componets/RidePopUp";
import ConfirmRidePop from "../componets/ConfirmRidePop";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState } from "react";
import { useRef } from "react";

const CaptainHome = () => {
  const [ridePopUpPanel, setRidePopUpPanel] = useState(true);
  const [confirmRidePopUpPanel, setConfirmRidePopUpPanel] = useState(false);

  const ridePopUpPanelRef = useRef(null);
  const confirmRidePopUpPanelRef = useRef(null);

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
      <div className="fixed p-3 top-0 flex items-center justify-between p-4 w-full">
        <img className="w-16" src="/uber.png" alt="" />
        <Link
          to="/home"
          className=" h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="font-medium text-lg ri-home-5-line"></i>
        </Link>
      </div>
      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://s3-eu-west-1.amazonaws.com/adminjs-blog/2023/05/0_HzyjQ7h0baWklQeF.webp"
          alt=""
        />
      </div>

      <div className="h-2/5 p-4">
        <CaptainDetails />
      </div>
      <div
        ref={ridePopUpPanelRef}
        className="fixed w-full bg-white z-10 translate-y-full bottom-0  px-3 py-6 pt-12"
      >
        <RidePopUp
          setRidePopUpPanel={setRidePopUpPanel}
          setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
        />
      </div>
      <div
        ref={confirmRidePopUpPanelRef}
        className="fixed w-full bg-white z-10 h-screen translate-y-full bottom-0  px-3 py-6 pt-12"
      >
        <ConfirmRidePop setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} />
      </div>
    </div>
  );
};

export default CaptainHome;
