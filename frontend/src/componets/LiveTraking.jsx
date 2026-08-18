import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 21.1702,
  lng: 72.8311,
};

const LiveTraking = () => {
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => console.error("Error getting initial location:", err),
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 30000 },
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => console.error("Location watch error:", err),
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker position={currentPosition} />
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTraking;
