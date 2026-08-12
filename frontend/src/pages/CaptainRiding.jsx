import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from "../componets/FinishRide";
const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);

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
      <div className="fixed p-3 top-0 flex items-center justify-between p-4 w-full">
        <img className="w-16" src="/uber.png" alt="" />
        <Link
          to="/captain-home"
          className=" h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="font-medium text-lg ri-home-5-line"></i>
        </Link>
      </div>
      <div className="h-4/5">
        <img
          className="h-full w-full object-cover"
          src="https://s3-eu-west-1.amazonaws.com/adminjs-blog/2023/05/0_HzyjQ7h0baWklQeF.webp"
          alt=""
        />
      </div>

      <div className="h-1/5 p-6 flex items-center justify-between bg-black/87">
        <h4 className="text-xl font-semibold text-white">4 km away</h4>
        <button className="bg-white text-black font-semibold p-2 px-12 rounded-lg cursor-pointer">
          Complete Ride
        </button>
      </div>
      <div
        ref={finishRidePanelRef}
        className="fixed w-full bg-white z-10 h-[79%] translate-y-full bottom-0 px-3 py-6 pt-12 rounded-t-3xl"
      >
        <FinishRide setFinishRidePanel={setFinishRidePanel} />
      </div>
    </div>
  );
};
export default CaptainRiding;
