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
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getApiBaseUrl } from "../config";

const Home = () => {
  const [pickup, setPickup] = useState(() => sessionStorage.getItem("home_pickup") || "");
  const [destination, setDestination] = useState(() => sessionStorage.getItem("home_destination") || "");
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmedRideRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(() => sessionStorage.getItem("home_vehiclePanelOpen") === "true");
  const [confirmedRide, setConfirmedRide] = useState(() => sessionStorage.getItem("home_confirmedRide") === "true");
  const [vehicleFound, setVehicleFound] = useState(() => sessionStorage.getItem("home_vehicleFound") === "true");
  const [waitingForDriver, setWaitingForDriver] = useState(() => sessionStorage.getItem("home_waitingForDriver") === "true");
  const [fare, setFare] = useState(() => {
    try {
      const saved = sessionStorage.getItem("home_fare");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [vehicleType, setVehicleType] = useState(() => sessionStorage.getItem("home_vehicleType") || null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [ride, setRide] = useState(() => {
    try {
      const saved = sessionStorage.getItem("home_ride");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  const [user] = useContext(UserDataContext);

  const resetAllPanels = () => {
    setWaitingForDriver(false);
    setVehicleFound(false);
    setConfirmedRide(false);
    setVehiclePanelOpen(false);
    setPanelOpen(false);
    setPickup("");
    setDestination("");
    setFare({});
    setVehicleType(null);
    setRide(null);
    sessionStorage.removeItem("activeRide");
    sessionStorage.removeItem("home_pickup");
    sessionStorage.removeItem("home_destination");
    sessionStorage.removeItem("home_vehiclePanelOpen");
    sessionStorage.removeItem("home_confirmedRide");
    sessionStorage.removeItem("home_vehicleFound");
    sessionStorage.removeItem("home_waitingForDriver");
    sessionStorage.removeItem("home_fare");
    sessionStorage.removeItem("home_vehicleType");
    sessionStorage.removeItem("home_ride");
  };

  useEffect(() => {
    if (location.state?.resetPanels) {
      resetAllPanels();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    if (pickup || destination || vehiclePanelOpen || confirmedRide || vehicleFound || waitingForDriver) {
      sessionStorage.setItem("home_pickup", pickup);
      sessionStorage.setItem("home_destination", destination);
      sessionStorage.setItem("home_vehiclePanelOpen", vehiclePanelOpen);
      sessionStorage.setItem("home_confirmedRide", confirmedRide);
      sessionStorage.setItem("home_vehicleFound", vehicleFound);
      sessionStorage.setItem("home_waitingForDriver", waitingForDriver);
      sessionStorage.setItem("home_fare", JSON.stringify(fare));
      if (vehicleType) sessionStorage.setItem("home_vehicleType", vehicleType);
      if (ride) sessionStorage.setItem("home_ride", JSON.stringify(ride));
    } else {
      sessionStorage.removeItem("home_pickup");
      sessionStorage.removeItem("home_destination");
      sessionStorage.removeItem("home_vehiclePanelOpen");
      sessionStorage.removeItem("home_confirmedRide");
      sessionStorage.removeItem("home_vehicleFound");
      sessionStorage.removeItem("home_waitingForDriver");
      sessionStorage.removeItem("home_fare");
      sessionStorage.removeItem("home_vehicleType");
      sessionStorage.removeItem("home_ride");
    }
  }, [pickup, destination, vehiclePanelOpen, confirmedRide, vehicleFound, waitingForDriver, fare, vehicleType, ride]);

  useEffect(() => {
    if (user && user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }
  }, [user?._id, socket]);

  useEffect(() => {
    socket.on("ride-confirmed", (rideData) => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(rideData);
    });

    socket.on("ride-started", (rideData) => {
      resetAllPanels();
      navigate("/riding", { state: { ride: rideData } });
    });

    socket.on("ride-ended", () => {
      resetAllPanels();
    });

    socket.on("ride-cancelled", () => {
      resetAllPanels();
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-started");
      socket.off("ride-ended");
      socket.off("ride-cancelled");
    };
  }, [socket, navigate]);

  const findTrip = async () => {
    if (!pickup.trim() || !destination.trim()) {
      return;
    }
    setVehiclePanelOpen(true);
    setPanelOpen(false);

    try {
      const response = await axios.get(`${getApiBaseUrl()}/rides/get-fare`, {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFare(response.data);
    } catch (error) {
      console.error("Error fetching fare:", error);
    }
  };

  const debounceTimerRef = useRef(null);

  const fetchSuggestions = (query) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!query || query.trim().length <= 2) {
      setSuggestions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${getApiBaseUrl()}/maps/get-suggestion`,
          {
            params: { input: query },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 2000,
          },
        );
        if (Array.isArray(response.data)) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error.message);
        setSuggestions([]);
      }
    }, 200);
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickup(value);
    setActiveField("pickup");
    fetchSuggestions(value);
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setActiveField("destination");
    fetchSuggestions(value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const createRide = async (vehicleType) => {
    const response = await axios.post(
      `${getApiBaseUrl()}/rides/create`,

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
          duration: 0.4,
          ease: "power3.inOut",
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0%",
          padding: 0,
          duration: 0.4,
          ease: "power3.inOut",
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    [panelOpen],
  );

  useGSAP(
    function () {
      if (vehiclePanelOpen) {
        gsap.to(vehiclePanelRef.current, {
          y: "0%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          y: "100%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    [vehiclePanelOpen],
  );

  useGSAP(
    function () {
      if (confirmedRide) {
        gsap.to(confirmedRideRef.current, {
          y: "0%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(confirmedRideRef.current, {
          y: "100%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    [confirmedRide],
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          y: "0%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          y: "100%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    [vehicleFound],
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          y: "0%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          y: "100%",
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    [waitingForDriver],
  );

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative bg-white">
        {/* Top Header Logo & Logout */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
          <img
            className={`w-16 transition-opacity duration-300 drop-shadow-md pointer-events-auto ${
              panelOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            src="/uber.png"
            alt="Uber logo"
          />
          <Link
            to="/logout"
            title="Logout"
            className="h-10 w-10 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center rounded-full text-gray-800 hover:bg-black hover:text-white transition-all pointer-events-auto cursor-pointer"
          >
            <i className="ri-logout-box-r-line text-lg"></i>
          </Link>
        </div>

        {/* Live Map Background */}
        <div className="h-full w-full">
          <LiveTraking />
        </div>

        {/* Bottom Booking Interface */}
        <div className="flex flex-col justify-end h-full absolute inset-0 z-10 pointer-events-none">
          <div className="bg-white p-6 rounded-t-3xl shadow-2xl relative pointer-events-auto border-t border-gray-100">
            <h5
              onClick={() => {
                setPanelOpen(false);
              }}
              ref={panelCloseRef}
              className="absolute opacity-0 top-4 right-5 text-gray-500 hover:text-black cursor-pointer text-2xl transition-all"
            >
              <i className="ri-arrow-down-wide-line"></i>
            </h5>
            <h4 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">
              Find a Trip
            </h4>

            <form onSubmit={submitHandler} className="relative space-y-3">
              {/* Connecting Line Indicator */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-300 flex flex-col justify-between items-center py-2 z-10">
                <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></div>
              </div>

              <div className="relative flex items-center">
                <input
                  className="w-full bg-gray-100/90 border border-gray-200 pl-11 pr-10 py-3 text-sm font-semibold rounded-2xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  type="text"
                  placeholder="Add a pick-up location"
                  value={pickup}
                  onClick={() => {
                    setPanelOpen(true);
                    setActiveField("pickup");
                  }}
                  onChange={handlePickupChange}
                />
                <button
                  type="button"
                  title="Use Current Location"
                  onClick={() => {
                    if (navigator.geolocation) {
                      setPickup("Locating current position...");
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const { latitude, longitude } = position.coords;
                          try {
                            const response = await fetch(
                              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                            );
                            const data = await response.json();
                            if (data && data.display_name) {
                              setPickup(data.display_name);
                            } else {
                              setPickup(
                                `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                              );
                            }
                          } catch (err) {
                            console.error("Reverse geocoding error:", err);
                            setPickup(
                              `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                            );
                          }
                        },
                        (error) => {
                          console.error("Geolocation error:", error);
                          setPickup("Current Location");
                        },
                      );
                    } else {
                      setPickup("Current Location");
                    }
                  }}
                  className="absolute right-3 text-gray-500 hover:text-black p-1 transition-colors cursor-pointer"
                >
                  <i className="ri-navigation-fill text-blue-600 text-lg"></i>
                </button>
              </div>

              <div className="relative">
                <input
                  className="w-full bg-gray-100/90 border border-gray-200 pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  type="text"
                  placeholder="Enter your destination"
                  value={destination}
                  onClick={() => {
                    setPanelOpen(true);
                    setActiveField("destination");
                  }}
                  onChange={handleDestinationChange}
                />
              </div>
            </form>

            <button
              onClick={findTrip}
              className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 text-white py-3.5 rounded-2xl mt-4 font-bold text-base shadow-xl shadow-black/10 flex justify-center items-center cursor-pointer"
            >
              Search Rides
              <i className="ri-arrow-right-line ml-2 text-lg"></i>
            </button>
          </div>

          <div
            ref={panelRef}
            className="bg-white h-0 px-6 overflow-y-auto pointer-events-auto"
          >
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

        {/* Bottom Sheet Panels */}
        <div
          ref={vehiclePanelRef}
          className="fixed md:absolute w-full max-w-md bg-white z-30 bottom-0 translate-y-full px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100"
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
          className="fixed md:absolute w-full max-w-md bg-white z-30 bottom-0 translate-y-full px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100"
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
          className="fixed md:absolute w-full max-w-md bg-white z-30 bottom-0 translate-y-full px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100"
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
          className="fixed md:absolute w-full max-w-md bg-white z-30 bottom-0 translate-y-full px-5 py-6 rounded-t-3xl shadow-2xl border-t border-gray-100"
        >
          <WaitingForDriver
            ride={ride}
            setWaitingForDriver={setWaitingForDriver}
            waitingForDriver={waitingForDriver}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
