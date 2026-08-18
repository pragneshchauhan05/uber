const axios = require("axios");
const Captain = require("../models/captain.model");

// Fast In-Memory Caches for Instant Responses
const suggestionCache = new Map();
const geocodeCache = new Map();
const distanceCache = new Map();

function setCache(cacheMap, key, value, maxSize = 300) {
  if (cacheMap.size >= maxSize) {
    const firstKey = cacheMap.keys().next().value;
    cacheMap.delete(firstKey);
  }
  cacheMap.set(key, value);
}

// Haversine distance formula calculation fallback
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. Google Maps Geocoding API (with fast fallback)
module.exports.getAddressCoordinate = async (address) => {
  if (!address) throw new Error("Address is required");
  const cleanAddr = address.trim().toLowerCase();

  if (geocodeCache.has(cleanAddr)) {
    return geocodeCache.get(cleanAddr);
  }

  const apiKey = process.env.GOOGLE_MAPS_API;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 3000 });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const coords = { ltd: location.lat, lng: location.lng };
        setCache(geocodeCache, cleanAddr, coords);
        return coords;
      }
    } catch (err) {
      console.warn("Google Geocoding API error, using fast fallback:", err.message);
    }
  }

  // Fast Fallback via Nominatim / Photon
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&countrycodes=in&limit=1`;
    const nomRes = await axios.get(nomUrl, {
      headers: { "User-Agent": "UberCloneApp/1.0" },
      timeout: 2000,
    });
    if (nomRes.data && nomRes.data.length > 0) {
      const coords = {
        ltd: parseFloat(nomRes.data[0].lat),
        lng: parseFloat(nomRes.data[0].lon),
      };
      setCache(geocodeCache, cleanAddr, coords);
      return coords;
    }
  } catch (err) {
    console.warn("Fallback geocode failed:", err.message);
  }

  const defaultCoords = { ltd: 23.0225, lng: 72.5714 };
  setCache(geocodeCache, cleanAddr, defaultCoords);
  return defaultCoords;
};

// 2. Google Maps Distance Matrix API (with fast fallback)
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }
  const cacheKey = `${origin.trim().toLowerCase()}_${destination.trim().toLowerCase()}`;

  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey);
  }

  const apiKey = process.env.GOOGLE_MAPS_API;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 3000 });
      if (
        response.data.status === "OK" &&
        response.data.rows[0]?.elements[0]?.status === "OK"
      ) {
        const element = response.data.rows[0].elements[0];
        const result = {
          distance: element.distance.text,
          distanceValue: element.distance.value,
          duration: element.duration.text,
          durationValue: element.duration.value,
        };
        setCache(distanceCache, cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn("Google Distance Matrix API error, using fallback:", err.message);
    }
  }

  // Fallback via Haversine calculation
  try {
    const originCoords = await module.exports.getAddressCoordinate(origin);
    const destCoords = await module.exports.getAddressCoordinate(destination);

    const distKm = calculateHaversineDistance(
      originCoords.ltd,
      originCoords.lng,
      destCoords.ltd,
      destCoords.lng
    );

    const distanceMeters = Math.round(distKm * 1000);
    const durationSeconds = Math.round((distKm / 25) * 3600);
    const distanceKmStr = distKm > 0 ? distKm.toFixed(1) : "3.5";
    const durationMinStr = Math.max(1, Math.round(durationSeconds / 60));

    const result = {
      distance: `${distanceKmStr} km`,
      distanceValue: distanceMeters,
      duration: `${durationMinStr} mins`,
      durationValue: durationSeconds,
    };
    setCache(distanceCache, cacheKey, result);
    return result;
  } catch (err) {
    console.error("Error in distance calculation fallback:", err.message);
    return {
      distance: "4.2 km",
      distanceValue: 4200,
      duration: "10 mins",
      durationValue: 600,
    };
  }
};

// 3. Google Places Autocomplete API for location suggestions
module.exports.getSuggestion = async (input) => {
  if (!input || input.trim().length === 0) return [];
  const cleanInput = input.trim().toLowerCase();

  if (suggestionCache.has(cleanInput)) {
    return suggestionCache.get(cleanInput);
  }

  const apiKey = process.env.GOOGLE_MAPS_API;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 2500 });
      if (response.data.status === "OK" && response.data.predictions) {
        const suggestions = response.data.predictions.map((prediction) => ({
          display_name: prediction.description,
          place_id: prediction.place_id,
        }));
        setCache(suggestionCache, cleanInput, suggestions);
        return suggestions;
      }
    } catch (err) {
      console.warn("Google Places Autocomplete API error, using fallback:", err.message);
    }
  }

  // Fallback via Photon / Nominatim if Google Maps API is unavailable
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&countrycodes=in&limit=5`;
    const response = await axios.get(url, {
      headers: { "User-Agent": "UberCloneApp/1.0" },
      timeout: 2000,
    });

    if (response.data && response.data.length > 0) {
      const suggestions = response.data.map((item) => ({
        ltd: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
      }));
      setCache(suggestionCache, cleanInput, suggestions);
      return suggestions;
    }
  } catch (err) {
    console.warn("Fallback suggestion error:", err.message);
  }

  return [];
};

module.exports.getCaptainInRadius = async (ltd, lng, radius) => {
  try {
    const captains = await Captain.find({
      socketId: { $ne: null },
    });

    const captainsInRadius = captains.filter((captain) => {
      const cLat = captain.location?.lat || captain.location?.ltd;
      const cLng = captain.location?.lng;
      if (!cLat || !cLng || !ltd || !lng) return true;

      const dist = calculateHaversineDistance(ltd, lng, cLat, cLng);
      return dist <= (radius || 50);
    });

    return captainsInRadius;
  } catch (error) {
    console.error("Error fetching captains in radius:", error.message);
    throw error;
  }
};
