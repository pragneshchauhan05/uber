import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useJsApiLoader, GoogleMap, MarkerF, Polyline } from "@react-google-maps/api";

const MAP_LIBRARIES = ["marker", "places"];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 21.1702,
  lng: 72.8311,
};

// Haversine distance helper in meters
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const LeafletMap = ({ currentPosition, pickupCoords, dropCoords, captainCoords }) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const captainMarkerRef = useRef(null);
  const captainPolylineRef = useRef(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(Boolean(window.L));
  const [osrmEta, setOsrmEta] = useState("");
  const [osrmDistance, setOsrmDistance] = useState("");
  const lastOsrmCalcRef = useRef(null);

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

    const centerLat = captainCoords?.lat || pickupCoords?.lat || currentPosition.lat;
    const centerLng = captainCoords?.lng || pickupCoords?.lng || currentPosition.lng;

    if (!leafletMapRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([centerLat, centerLng], 14);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      window.L.control.zoom({ position: "bottomright" }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Current position marker
    if (!pickupCoords && !dropCoords && !captainCoords) {
      const customIcon = window.L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="background-color: #000; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      if (!currentMarkerRef.current) {
        currentMarkerRef.current = window.L.marker(
          [currentPosition.lat, currentPosition.lng],
          { icon: customIcon },
        ).addTo(map);
      } else {
        currentMarkerRef.current.setLatLng([
          currentPosition.lat,
          currentPosition.lng,
        ]);
      }
    } else if (currentMarkerRef.current) {
      map.removeLayer(currentMarkerRef.current);
      currentMarkerRef.current = null;
    }

    // Captain Marker
    if (captainCoords?.lat && captainCoords?.lng) {
      const captainIcon = window.L.divIcon({
        className: "leaflet-captain-marker",
        html: `<div style="background-color: #0f172a; color: #38bdf8; border: 2px solid #38bdf8; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; items-center; gap: 4px;">🚖 Driver</div>`,
        iconSize: [68, 24],
        iconAnchor: [34, 24],
      });

      if (!captainMarkerRef.current) {
        captainMarkerRef.current = window.L.marker(
          [captainCoords.lat, captainCoords.lng],
          { icon: captainIcon },
        ).addTo(map);
      } else {
        captainMarkerRef.current.setLatLng([captainCoords.lat, captainCoords.lng]);
      }
    } else if (captainMarkerRef.current) {
      map.removeLayer(captainMarkerRef.current);
      captainMarkerRef.current = null;
    }

    // Pickup Marker
    if (pickupCoords?.lat && pickupCoords?.lng) {
      const pickupIcon = window.L.divIcon({
        className: "leaflet-pickup-marker",
        html: `<div style="background-color: #000; color: #fff; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; items-center; gap: 4px;">📍 Pickup</div>`,
        iconSize: [60, 24],
        iconAnchor: [30, 24],
      });

      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = window.L.marker(
          [pickupCoords.lat, pickupCoords.lng],
          { icon: pickupIcon },
        ).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // Drop Marker
    if (dropCoords?.lat && dropCoords?.lng) {
      const dropIcon = window.L.divIcon({
        className: "leaflet-drop-marker",
        html: `<div style="background-color: #059669; color: #fff; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; items-center; gap: 4px;">🏁 Drop</div>`,
        iconSize: [60, 24],
        iconAnchor: [30, 24],
      });

      if (!dropMarkerRef.current) {
        dropMarkerRef.current = window.L.marker(
          [dropCoords.lat, dropCoords.lng],
          { icon: dropIcon },
        ).addTo(map);
      } else {
        dropMarkerRef.current.setLatLng([dropCoords.lat, dropCoords.lng]);
      }
    } else if (dropMarkerRef.current) {
      map.removeLayer(dropMarkerRef.current);
      dropMarkerRef.current = null;
    }

    // Fetch OSRM Road Route for Leaflet
    const origin = captainCoords?.lat ? captainCoords : pickupCoords;
    const destination = captainCoords?.lat ? (pickupCoords?.lat ? pickupCoords : dropCoords) : dropCoords;

    if (origin?.lat && destination?.lat) {
      const distFromLast = lastOsrmCalcRef.current
        ? getDistanceInMeters(origin.lat, origin.lng, lastOsrmCalcRef.current.lat, lastOsrmCalcRef.current.lng)
        : 9999;

      if (distFromLast > 25) {
        lastOsrmCalcRef.current = { lat: origin.lat, lng: origin.lng };
        fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.routes && data.routes[0]) {
              const route = data.routes[0];
              const lineCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]);

              setOsrmDistance((route.distance / 1000).toFixed(1) + " km");
              setOsrmEta(Math.ceil(route.duration / 60) + " mins");

              if (!captainPolylineRef.current) {
                captainPolylineRef.current = window.L.polyline(lineCoords, {
                  color: "#2563eb",
                  weight: 5,
                  opacity: 0.85,
                }).addTo(map);
              } else {
                captainPolylineRef.current.setLatLngs(lineCoords);
              }
            }
          })
          .catch((err) => {
            console.error("OSRM Route Error:", err);
          });
      }
    } else if (captainPolylineRef.current) {
      map.removeLayer(captainPolylineRef.current);
      captainPolylineRef.current = null;
    }

    // Fit bounds priority: 1) Captain to Pickup 2) Pickup to Drop
    if (captainCoords?.lat && pickupCoords?.lat) {
      const bounds = window.L.latLngBounds(
        [captainCoords.lat, captainCoords.lng],
        [pickupCoords.lat, pickupCoords.lng],
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (pickupCoords?.lat && dropCoords?.lat) {
      const bounds = window.L.latLngBounds(
        [pickupCoords.lat, pickupCoords.lng],
        [dropCoords.lat, dropCoords.lng],
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords?.lat) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 15);
    }
  }, [isLeafletLoaded, currentPosition, pickupCoords, dropCoords, captainCoords]);

  return (
    <div ref={mapContainerRef} className="w-full h-full z-0 relative">
      {osrmDistance && osrmEta && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-black/90 text-white px-4 py-2 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 text-xs font-bold pointer-events-none">
          <span className="text-emerald-400">🚗 {osrmEta}</span>
          <span className="text-gray-400">•</span>
          <span>{osrmDistance} away</span>
        </div>
      )}
    </div>
  );
};

const LiveTraking = ({ pickupCoords, dropCoords, captainCoords }) => {
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [map, setMap] = useState(null);
  const [mapError, setMapError] = useState(false);

  // Directions state
  const [directionsPath, setDirectionsPath] = useState([]);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isDriverArrived, setIsDriverArrived] = useState(false);

  const lastCalcOriginRef = useRef(null);
  const lastCalcDestRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES,
  });

  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("google.maps.Marker is deprecated")
      ) {
        return;
      }
      originalWarn(...args);
    };

    window.gm_authFailure = () => {
      console.warn(
        "Google Maps API auth/quota failure detected. Switching to OpenStreetMap fallback.",
      );
      setMapError(true);
    };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate Real Road-Following Driving Route between Driver & Destination
  useEffect(() => {
    // Determine Origin and Destination
    let origin = null;
    let destination = null;

    if (captainCoords?.lat && captainCoords?.lng && dropCoords?.lat && dropCoords?.lng) {
      origin = captainCoords;
      destination = dropCoords;
    } else if (captainCoords?.lat && captainCoords?.lng && pickupCoords?.lat && pickupCoords?.lng) {
      origin = captainCoords;
      destination = pickupCoords;
    } else if (pickupCoords?.lat && pickupCoords?.lng && dropCoords?.lat && dropCoords?.lng) {
      origin = pickupCoords;
      destination = dropCoords;
    }

    if (!origin?.lat || !destination?.lat) {
      setDirectionsPath([]);
      setDistanceText("");
      setDurationText("");
      setIsDriverArrived(false);
      return;
    }

    // Check distance between driver & destination to handle arrival (< 30m)
    const currentDistMeters = getDistanceInMeters(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
    );

    if (currentDistMeters > 0 && currentDistMeters < 30) {
      setIsDriverArrived(true);
      setDistanceText("Arrived");
      setDurationText("0 min");
    } else {
      setIsDriverArrived(false);
    }

    // Check movement threshold (> 15 meters)
    const distOriginMoved = lastCalcOriginRef.current
      ? getDistanceInMeters(
          origin.lat,
          origin.lng,
          lastCalcOriginRef.current.lat,
          lastCalcOriginRef.current.lng,
        )
      : 9999;

    const distDestMoved = lastCalcDestRef.current
      ? getDistanceInMeters(
          destination.lat,
          destination.lng,
          lastCalcDestRef.current.lat,
          lastCalcDestRef.current.lng,
        )
      : 9999;

    if (distOriginMoved < 15 && distDestMoved < 15 && directionsPath.length > 0) {
      return;
    }

    lastCalcOriginRef.current = { lat: origin.lat, lng: origin.lng };
    lastCalcDestRef.current = { lat: destination.lat, lng: destination.lng };
    setIsLoadingRoute(true);

    const fetchOsrmRoadRoute = () => {
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
      )
        .then((res) => res.json())
        .then((data) => {
          setIsLoadingRoute(false);
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const pathPoints = route.geometry.coordinates.map((c) => ({
              lat: c[1],
              lng: c[0],
            }));
            setDirectionsPath(pathPoints);
            setDistanceText((route.distance / 1000).toFixed(1) + " km");
            setDurationText(Math.ceil(route.duration / 60) + " mins");
          }
        })
        .catch((err) => {
          console.error("OSRM Road Route Fallback Error:", err);
          setIsLoadingRoute(false);
        });
    };

    if (window.google && window.google.maps) {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: new window.google.maps.LatLng(origin.lat, origin.lng),
            destination: new window.google.maps.LatLng(destination.lat, destination.lng),
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result.routes?.[0]) {
              setIsLoadingRoute(false);
              const route = result.routes[0];
              const leg = route.legs?.[0];

              if (route.overview_path) {
                const pathPoints = route.overview_path.map((pt) => ({
                  lat: pt.lat(),
                  lng: pt.lng(),
                }));
                setDirectionsPath(pathPoints);
              }

              if (leg) {
                setDistanceText(leg.distance?.text || "");
                setDurationText(leg.duration?.text || "");
              }
            } else {
              console.warn(
                "Google Directions status:",
                status,
                "- using OSRM real road route",
              );
              fetchOsrmRoadRoute();
            }
          },
        );
      } catch (err) {
        console.warn("Google Directions exception - using OSRM real road route", err);
        fetchOsrmRoadRoute();
      }
    } else {
      fetchOsrmRoadRoute();
    }
  }, [map, captainCoords, pickupCoords, dropCoords]);

  // Fit bounds when Google Maps is loaded and coordinates change
  useEffect(() => {
    if (map && window.google) {
      if (captainCoords?.lat && pickupCoords?.lat) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(captainCoords);
        bounds.extend(pickupCoords);
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      } else if (pickupCoords?.lat && dropCoords?.lat) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(pickupCoords);
        bounds.extend(dropCoords);
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      } else if (captainCoords?.lat && dropCoords?.lat) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(captainCoords);
        bounds.extend(dropCoords);
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      } else if (pickupCoords?.lat) {
        map.panTo(pickupCoords);
        map.setZoom(15);
      }
    }
  }, [map, pickupCoords, dropCoords, captainCoords]);

  if (loadError || mapError || !apiKey) {
    return (
      <LeafletMap
        currentPosition={currentPosition}
        pickupCoords={pickupCoords}
        dropCoords={dropCoords}
        captainCoords={captainCoords}
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Map...</span>
        </div>
      </div>
    );
  }

  const mapCenter = captainCoords?.lat
    ? captainCoords
    : pickupCoords?.lat
      ? pickupCoords
      : currentPosition;

  return (
    <div className="w-full h-full relative">
      {/* Floating Distance & ETA Overlay Badge */}
      {(isLoadingRoute || distanceText || durationText) && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-black text-white px-4 py-2 rounded-full shadow-2xl border border-gray-700 flex items-center gap-2.5 pointer-events-none transition-all animate-fade-in whitespace-nowrap">
          {isLoadingRoute ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Calculating Route...</span>
            </div>
          ) : isDriverArrived ? (
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              <span>Arrived at Destination!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <span className="text-white flex items-center gap-1">
                <i className="ri-car-fill text-sm"></i>
                {durationText} ETA
              </span>
              <span className="text-white/40">•</span>
              <span className="text-gray-300">{distanceText} away</span>
            </div>
          )}
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {!pickupCoords && !dropCoords && !captainCoords && (
          <MarkerF position={currentPosition} />
        )}

        {/* Driver Marker */}
        {captainCoords?.lat && captainCoords?.lng && (
          <MarkerF
            position={captainCoords}
            title="Driver Location"
            label={{ text: "🚖", color: "#ffffff", fontWeight: "bold" }}
          />
        )}

        {/* Pickup Marker */}
        {pickupCoords?.lat && pickupCoords?.lng && (
          <MarkerF
            position={pickupCoords}
            title="Pickup Location"
            label={{ text: "📍", color: "#ffffff", fontWeight: "bold" }}
          />
        )}

        {/* Drop Marker */}
        {dropCoords?.lat && dropCoords?.lng && (
          <MarkerF
            position={dropCoords}
            title="Drop Location"
            label={{ text: "🏁", color: "#ffffff", fontWeight: "bold" }}
          />
        )}

        {/* Real Road-following Polyline */}
        {directionsPath.length > 0 && (
          <Polyline
            path={directionsPath}
            options={{
              strokeColor: "#000000",
              strokeOpacity: 0.95,
              strokeWeight: 6,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default memo(LiveTraking);
