import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 21.1702,
  lng: 72.8311,
};

const LeafletMap = ({ currentPosition }) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
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

    if (!leafletMapRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([currentPosition.lat, currentPosition.lng], 15);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      window.L.control.zoom({ position: "bottomright" }).addTo(map);

      const customIcon = window.L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="background-color: #000; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = window.L.marker([currentPosition.lat, currentPosition.lng], { icon: customIcon }).addTo(map);

      leafletMapRef.current = map;
      markerRef.current = marker;
    } else {
      leafletMapRef.current.setView([currentPosition.lat, currentPosition.lng]);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
      }
    }
  }, [isLeafletLoaded, currentPosition]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 relative" />;
};

const LiveTraking = () => {
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [, setMap] = useState(null);
  const [mapError, setMapError] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("Google Maps API auth/quota failure detected. Switching to OpenStreetMap fallback.");
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

  if (loadError || mapError || !apiKey) {
    return <LeafletMap currentPosition={currentPosition} />;
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

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <Marker position={currentPosition} />
    </GoogleMap>
  );
};

export default memo(LiveTraking);
