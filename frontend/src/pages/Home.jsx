import React, { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../componets/LocationSearchPanel";
import VehiclePanel from "../componets/VehiclePanel";
import ConfirmedRide from "../componets/ConfirmedRide";
import LookingForDriver from "../componets/LookingForDriver";
import WaitingForDriver from "../componets/WaitingForDriver";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmedRideRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false);
  const [confirmedRide, setConfirmedRide] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const submitHandler = (e) => {
    e.preventDefault();
  };

  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "70%",
          padding: 24,
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0%",
          padding: 0,
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        });
      }
    },
    [panelOpen],
  );

  useGSAP(
    function () {
      if (vehiclePanelOpen) {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehiclePanelOpen],
  );

  useGSAP(
    function () {
      if (confirmedRide) {
        gsap.to(confirmedRideRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmedRideRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmedRide],
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehicleFound],
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [waitingForDriver],
  );

  return (
    <div className="h-screen relative overflow-hidden">
      <div>
        <img
          className="w-17 absolute left-5 top-5"
          src="/uber.png"
          alt="uber logo"
        />
        {/* temprory image  */}
        <div className="h-screen w-screen">
          <img
            className=""
            src="https://s3-eu-west-1.amazonaws.com/adminjs-blog/2023/05/0_HzyjQ7h0baWklQeF.webp"
            alt=""
          />
        </div>
        <div className=" flex flex-col justify-end h-screen absolute bottom-0 w-full ">
          <div className="h-[30%] bg-white p-5 relative">
            <h5
              onClick={() => {
                setPanelOpen(false);
              }}
              ref={panelCloseRef}
              className="absolute opacity-0 top-3 right-3 text-xl cursor-pointer"
            >
              <i className="ri-arrow-down-wide-line"></i>
            </h5>
            <h4 className="text-2xl font-semibold">Find a trip</h4>
            <form onSubmit={submitHandler}>
              <div className="line absolute h-16 w-1 top-[43%] left-8  bg-gray-700 rounded-full"></div>
              <input
                className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-5"
                type="text"
                placeholder="Add a pick-up location"
                value={pickup}
                onClick={() => setPanelOpen(true)}
                onChange={(e) => {
                  setPickup(e.target.value);
                }}
              />
              <input
                className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3"
                type="text"
                placeholder="Enter your destination"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                }}
                onClick={() => setPanelOpen(true)}
              />
            </form>
          </div>
          <div ref={panelRef} className="h-[70%] bg-white h-0">
            <LocationSearchPanel
              setPanelOpen={setPanelOpen}
              setVehiclePanelOpen={setVehiclePanelOpen}
            />
          </div>
        </div>
      </div>
      <div
        ref={vehiclePanelRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-10 pt-12"
      >
        <VehiclePanel
          setConfirmedRide={setConfirmedRide}
          setVehiclePanelOpen={setVehiclePanelOpen}
        />
      </div>
      <div
        ref={confirmedRideRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-6 pt-12"
      >
        <ConfirmedRide
          setConfirmedRide={setConfirmedRide}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={vehicleFoundRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-6 pt-12"
      >
        <LookingForDriver setVehicleFound={setVehicleFound} />
      </div>
      <div
        ref={waitingForDriverRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-6 pt-12"
      >
        <WaitingForDriver
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </div>
    </div>
  );
};

export default Home;
