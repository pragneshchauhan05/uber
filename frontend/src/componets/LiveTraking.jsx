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

const LeafletMap = ({ currentPosition, pickupCoords, dropCoords }) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const currentMarkerRef = useRef(null);
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

    const centerLat = pickupCoords?.lat || currentPosition.lat;
    const centerLng = pickupCoords?.lng || currentPosition.lng;

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
    if (!pickupCoords && !dropCoords) {
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

    // Fit bounds if both pickup & drop exist
    if (pickupCoords?.lat && dropCoords?.lat) {
      const bounds = window.L.latLngBounds(
        [pickupCoords.lat, pickupCoords.lng],
        [dropCoords.lat, dropCoords.lng],
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords?.lat) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 15);
    }
  }, [isLeafletLoaded, currentPosition, pickupCoords, dropCoords]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 relative" />;
};

const LiveTraking = ({ pickupCoords, dropCoords }) => {
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [map, setMap] = useState(null);
  const [mapError, setMapError] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
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

  // Fit bounds when Google Maps is loaded and coordinates change
  useEffect(() => {
    if (map && window.google) {
      if (pickupCoords?.lat && dropCoords?.lat) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(pickupCoords);
        bounds.extend(dropCoords);
        map.fitBounds(bounds);
      } else if (pickupCoords?.lat) {
        map.panTo(pickupCoords);
        map.setZoom(15);
      }
    }
  }, [map, pickupCoords, dropCoords]);

  if (loadError || mapError || !apiKey) {
    return (
      <LeafletMap
        currentPosition={currentPosition}
        pickupCoords={pickupCoords}
        dropCoords={dropCoords}
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

  const mapCenter = pickupCoords?.lat ? pickupCoords : currentPosition;

  return (
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
      {!pickupCoords && !dropCoords && <Marker position={currentPosition} />}

      {pickupCoords?.lat && pickupCoords?.lng && (
        <Marker
          position={pickupCoords}
          title="Pickup Location"
          label={{ text: "P", color: "#ffffff", fontWeight: "bold" }}
        />
      )}

      {dropCoords?.lat && dropCoords?.lng && (
        <Marker
          position={dropCoords}
          title="Drop Location"
          label={{ text: "D", color: "#ffffff", fontWeight: "bold" }}
        />
      )}
    </GoogleMap>
  );
};

export default memo(LiveTraking);
