import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useJsApiLoader, GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { getApiBaseUrl } from "../config";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 23.0225,
  lng: 72.5714,
};

// Fallback OpenStreetMap Leaflet Map
const LeafletRouteMap = ({ startCoords, destCoords }) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polylineRef = useRef(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(Boolean(window.L));

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setIsLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsLeafletLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || !window.L) return;

    const centerLat = startCoords ? startCoords.lat : defaultCenter.lat;
    const centerLng = startCoords ? startCoords.lng : defaultCenter.lng;

    if (!leafletMapRef.current) {
      const map = window.L.map(mapContainerRef.current, { zoomControl: false }).setView(
        [centerLat, centerLng],
        11
      );

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      window.L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear previous markers & polylines
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const bounds = [];

    if (startCoords) {
      const startMarker = window.L.marker([startCoords.lat, startCoords.lng], {
        icon: window.L.divIcon({
          className: "custom-start-marker",
          html: `<div style="background:#10B981; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(0,0,0,0.4);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(map);
      startMarker.bindPopup(`<b>Start:</b> ${startCoords.address || "Start Location"}`);
      bounds.push([startCoords.lat, startCoords.lng]);
    }

    if (destCoords) {
      const destMarker = window.L.marker([destCoords.lat, destCoords.lng], {
        icon: window.L.divIcon({
          className: "custom-dest-marker",
          html: `<div style="background:#EF4444; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(0,0,0,0.4);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(map);
      destMarker.bindPopup(`<b>Destination:</b> ${destCoords.address || "Destination"}`);
      bounds.push([destCoords.lat, destCoords.lng]);
    }

    if (startCoords && destCoords) {
      const lineCoords = [
        [startCoords.lat, startCoords.lng],
        [destCoords.lat, destCoords.lng],
      ];
      polylineRef.current = window.L.polyline(lineCoords, {
        color: "#000000",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 8",
      }).addTo(map);

      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length > 0) {
      map.setView(bounds[0], 13);
    }
  }, [isLeafletLoaded, startCoords, destCoords]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 relative" />;
};

const CreateRoute = () => {
  const navigate = useNavigate();
  const [startAddress, setStartAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [departureDate, setDepartureDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [departureTime, setDepartureTime] = useState("09:00 AM");
  const [availableSeats, setAvailableSeats] = useState(3);
  const [myRoutes, setMyRoutes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded } = useJsApiLoader({
    id: "google-route-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    window.gm_authFailure = () => {
      setMapError(true);
    };
    fetchMyRoutes();

    const handlePopState = () => {
      navigate("/captain-home", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const fetchMyRoutes = async () => {
    try {
      const token = localStorage.getItem("captainToken");
      const res = await axios.get(`${getApiBaseUrl()}/api/routes/my-routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.routes) {
        setMyRoutes(res.data.routes);
      }
    } catch (err) {
      console.error("Error fetching captain routes:", err);
    }
  };

  const debounceTimerRef = useRef(null);

  const fetchSuggestions = (query, field) => {
    setActiveField(field);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!query || query.trim().length <= 2) {
      setSuggestions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("captainToken");
        const response = await axios.get(`${getApiBaseUrl()}/maps/get-suggestion`, {
          params: { input: query },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 2000,
        });
        if (Array.isArray(response.data)) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.warn("Suggestion fetch error:", err.message);
        setSuggestions([]);
      }
    }, 200);
  };

  const selectSuggestion = async (item) => {
    const address = item.display_name || item.description || item;
    setSuggestions([]);

    if (activeField === "start") {
      setStartAddress(address);
      geocodeAddress(address, "start");
    } else if (activeField === "dest") {
      setDestAddress(address);
      geocodeAddress(address, "dest");
    }
    setActiveField(null);
  };

  const geocodeAddress = async (address, type) => {
    try {
      const token = localStorage.getItem("captainToken");
      const res = await axios.get(`${getApiBaseUrl()}/maps/get-coordinates`, {
        params: { address },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        const lat = res.data.ltd || res.data.lat || 23.0225;
        const lng = res.data.lng || 72.5714;
        const coordObj = { address, lat: Number(lat), lng: Number(lng) };
        if (type === "start") setStartCoords(coordObj);
        if (type === "dest") setDestCoords(coordObj);
      }
    } catch (err) {
      console.warn("Geocode error, using default coordinates:", err.message);
      const fallback = { address, lat: 23.0225, lng: 72.5714 };
      if (type === "start") setStartCoords(fallback);
      if (type === "dest") setDestCoords(fallback);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!startAddress.trim() || !destAddress.trim()) {
      setAlertMsg({ type: "error", text: "Please enter both Start location and Destination." });
      return;
    }

    setIsSubmitting(true);
    setAlertMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("captainToken");
      const routeCoordinates = [];
      if (startCoords) routeCoordinates.push({ lat: startCoords.lat, lng: startCoords.lng });
      if (destCoords) routeCoordinates.push({ lat: destCoords.lat, lng: destCoords.lng });

      const payload = {
        startLocation: {
          address: startAddress,
          lat: startCoords?.lat || 23.0225,
          lng: startCoords?.lng || 72.5714,
        },
        destination: {
          address: destAddress,
          lat: destCoords?.lat || 23.0225,
          lng: destCoords?.lng || 72.5714,
        },
        routeCoordinates,
        departureDate,
        departureTime,
        availableSeats: Number(availableSeats),
      };

      const res = await axios.post(`${getApiBaseUrl()}/api/routes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        setAlertMsg({ type: "success", text: "Planned route published successfully!" });
        setStartAddress("");
        setDestAddress("");
        setStartCoords(null);
        setDestCoords(null);
        fetchMyRoutes();
      }
    } catch (err) {
      console.error("Publish route error:", err);
      const errMsg = err.response?.data?.message || "Failed to publish route. Try again.";
      setAlertMsg({ type: "error", text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      const token = localStorage.getItem("captainToken");
      await axios.delete(`${getApiBaseUrl()}/api/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRoutes((prev) => prev.filter((r) => r._id !== id));
      setAlertMsg({ type: "success", text: "Route deleted successfully." });
    } catch (err) {
      console.error("Delete route error:", err);
      setAlertMsg({ type: "error", text: "Failed to delete route." });
    }
  };

  const formattedDateString = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md h-screen md:h-[840px] md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col bg-white">
        {/* Top Header */}
        <div className="p-4 bg-black text-white flex items-center justify-between z-10 shadow-md">
          <div className="flex items-center gap-3">
            <Link
              to="/captain-home"
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
            >
              <i className="ri-arrow-left-line text-lg text-white"></i>
            </Link>
            <div>
              <h2 className="font-bold text-base tracking-tight">Create Captain Route</h2>
              <p className="text-[11px] text-gray-400">Phase 1: Publish Planned Route</p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            Captain
          </span>
        </div>

        {/* Content Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {alertMsg.text && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                alertMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <i
                className={`text-base ${
                  alertMsg.type === "success" ? "ri-checkbox-circle-fill" : "ri-error-warning-fill"
                }`}
              ></i>
              <span>{alertMsg.text}</span>
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handlePublish} className="bg-gray-50 border border-gray-100 p-4 rounded-3xl space-y-3.5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <i className="ri-route-line text-emerald-600"></i> Route Details
            </h3>

            {/* Pickup / Start Location */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                From (Pickup Location)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={startAddress}
                  placeholder="e.g. Ahmedabad"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                  onChange={(e) => {
                    setStartAddress(e.target.value);
                    fetchSuggestions(e.target.value, "start");
                  }}
                  required
                />
                <i className="ri-map-pin-2-fill absolute right-3.5 top-3 text-emerald-500"></i>
              </div>
              {activeField === "start" && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(item)}
                      className="p-2.5 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <i className="ri-map-pin-line mr-1 text-gray-400"></i>
                      {item.display_name || item.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Location */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                To (Destination)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destAddress}
                  placeholder="e.g. Gandhinagar"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                  onChange={(e) => {
                    setDestAddress(e.target.value);
                    fetchSuggestions(e.target.value, "dest");
                  }}
                  required
                />
                <i className="ri-map-pin-user-fill absolute right-3.5 top-3 text-red-500"></i>
              </div>
              {activeField === "dest" && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(item)}
                      className="p-2.5 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <i className="ri-map-pin-line mr-1 text-gray-400"></i>
                      {item.display_name || item.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Departure Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-black"
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Departure Time
                </label>
                <input
                  type="text"
                  value={departureTime}
                  placeholder="09:00 AM"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-black"
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Available Seats */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Available Seats
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={availableSeats}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-black"
                onChange={(e) => setAvailableSeats(e.target.value)}
                required
              />
            </div>

            {/* Route Map Preview */}
            <div className="h-44 w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100 mt-2">
              {!mapError && isLoaded && apiKey ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={startCoords ? { lat: startCoords.lat, lng: startCoords.lng } : defaultCenter}
                  zoom={startCoords && destCoords ? 11 : 12}
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  {startCoords && <Marker position={{ lat: startCoords.lat, lng: startCoords.lng }} />}
                  {destCoords && <Marker position={{ lat: destCoords.lat, lng: destCoords.lng }} />}
                  {startCoords && destCoords && (
                    <Polyline
                      path={[
                        { lat: startCoords.lat, lng: startCoords.lng },
                        { lat: destCoords.lat, lng: destCoords.lng },
                      ]}
                      options={{
                        strokeColor: "#000000",
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <LeafletRouteMap startCoords={startCoords} destCoords={destCoords} />
              )}
            </div>

            {/* Route Preview Card */}
            {(startAddress || destAddress) && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">
                  Preview Route
                </p>
                <div className="text-emerald-950 space-y-0.5 font-medium">
                  <p>
                    <span className="font-bold text-gray-700">From:</span> {startAddress || "Ahmedabad"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">To:</span> {destAddress || "Gandhinagar"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Date:</span>{" "}
                    {formattedDateString(departureDate)}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Departure:</span> {departureTime}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Seats:</span> {availableSeats}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-all cursor-pointer flex justify-center items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Publish Route"
              )}
            </button>
          </form>

          {/* Published Routes Section */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">
              My Published Planned Routes ({myRoutes.length})
            </h3>

            {myRoutes.length === 0 ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-400 font-medium">
                No planned routes published yet.
              </div>
            ) : (
              myRoutes.map((rt) => (
                <div
                  key={rt._id}
                  className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-sm space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {rt.status}
                    </span>
                    <button
                      onClick={() => handleDeleteRoute(rt._id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-sm"></i> Delete
                    </button>
                  </div>

                  <div className="text-xs font-medium text-gray-800 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-bold text-gray-900">From:</span> {rt.startLocation?.address}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      <span className="font-bold text-gray-900">To:</span> {rt.destination?.address}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                      <span>
                        <i className="ri-calendar-line"></i> {formattedDateString(rt.departureDate)}
                      </span>
                      <span>
                        <i className="ri-time-line"></i> {rt.departureTime}
                      </span>
                      <span>
                        <i className="ri-user-3-line"></i> {rt.availableSeats} Seats
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoute;
