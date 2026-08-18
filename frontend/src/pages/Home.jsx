import React, { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../componets/LocationSearchPanel";
import VehiclePanel from "../componets/VehiclePanel";
import ConfirmedRide from "../componets/ConfirmedRide";
import LookingForDriver from "../componets/LookingForDriver";
import WaitingForDriver from "../componets/WaitingForDriver";
import LiveTraking from "../componets/LiveTraking";
import { useEffect, useContext } from "react";
import { SocketContext } from "../Context/SocketContext";
import { UserDataContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";

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
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [ride, setRide] = useState(null);

  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [user] = useContext(UserDataContext);

  useEffect(() => {
    if (user && user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }
  }, [user, socket]);

  useEffect(() => {
    socket.on("ride-confirmed", (rideData) => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(rideData);
    });

    socket.on("ride-started", (rideData) => {
      setWaitingForDriver(false);
      navigate("/riding", { state: { ride: rideData } });
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-started");
    };
  }, [socket, navigate]);

  const findTrip = async () => {
    if (!pickup.trim() || !destination.trim()) {
      alert("Please enter both pickup and destination locations");
      return;
    }
    setVehiclePanelOpen(true);
    setPanelOpen(false);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: { pickup, destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setFare(response.data);
    } catch (error) {
      console.error("Error fetching fare:", error);
    }
  };

  const handlePickupChange = async (e) => {
    const value = e.target.value;
    setPickup(value);
    setActiveField("pickup");

    if (value.trim().length > 2) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestion`,
          {
            params: { input: value },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (Array.isArray(response.data)) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching pickup suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setDestination(value);
    setActiveField("destination");

    if (value.trim().length > 2) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestion`,
          {
            params: { input: value },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (Array.isArray(response.data)) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching destination suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const createRide = async (vehicleType) => {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/create`,
      {
        pickup,
        destination,
        vehicleType,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    console.log(response.data);
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
          className={`w-16 absolute left-5 top-5 z-10 transition-opacity duration-300 ${
            panelOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          src="/uber.png"
          alt="uber logo"
        />
        <div className="h-screen w-screen">
          <LiveTraking />
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
                onClick={() => {
                  setPanelOpen(true);
                  setActiveField("pickup");
                }}
                onChange={handlePickupChange}
              />
              <input
                className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3"
                type="text"
                placeholder="Enter your destination"
                value={destination}
                onClick={() => {
                  setPanelOpen(true);
                  setActiveField("destination");
                }}
                onChange={handleDestinationChange}
              />
            </form>
            <button
              onClick={findTrip}
              className="bg-black text-white w-full py-2 rounded-lg mt-5 font-semibold text-lg cursor-pointer"
            >
              Find a Trip
            </button>
          </div>
          <div ref={panelRef} className="h-[70%] bg-white h-0">
            <LocationSearchPanel
              suggestions={suggestions}
              setPickup={setPickup}
              setDestination={setDestination}
              activeField={activeField}
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
          fare={fare}
          setVehicleType={setVehicleType}
          setConfirmedRide={setConfirmedRide}
          setVehiclePanelOpen={setVehiclePanelOpen}
        />
      </div>
      <div
        ref={confirmedRideRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-6 pt-12"
      >
        <ConfirmedRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmedRide={setConfirmedRide}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={vehicleFoundRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-6 pt-12"
      >
        <LookingForDriver
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={waitingForDriverRef}
        className="fixed w-full bg-white z-10 bottom-0 translate-y-full px-3 py-6 pt-12"
      >
        <WaitingForDriver
          ride={ride}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </div>
    </div>
  );
};

export default Home;
