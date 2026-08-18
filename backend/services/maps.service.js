const axios = require("axios");
const axiosInstance = axios;
const Captain = require("../models/captain.model");

// Haversine formula to compute straight-line distance in km between two lat/lon points
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

// Fast Geocoding helper restricted strictly to India
const geocodeAddress = async (address) => {
  // 1. Try Photon (restricted to India using India bbox: 68.1,6.5,97.4,35.5)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&bbox=68.1,6.5,97.4,35.5&limit=1`;
    const res = await axiosInstance.get(photonUrl, { timeout: 4000 });
    if (res.data?.features?.length > 0) {
      const coords = res.data.features[0].geometry.coordinates;
      return { lat: coords[1], lon: coords[0] };
    }
  } catch (err) {
    console.warn("Photon geocode failed, using Nominatim fallback");
  }

  // 2. Nominatim fallback restricted to India (countrycodes=in)
  const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&countrycodes=in&limit=1`;
  const nomRes = await axiosInstance.get(nomUrl, {
    headers: { "User-Agent": "UberCloneApp/1.0" },
    timeout: 4000,
  });
  if (nomRes.data && nomRes.data.length > 0) {
    return {
      lat: parseFloat(nomRes.data[0].lat),
      lon: parseFloat(nomRes.data[0].lon),
    };
  }

  throw new Error(`Could not find coordinates in India for: ${address}`);
};

module.exports.getAddressCoordinate = async (address) => {
  try {
    const coords = await geocodeAddress(address);
    return {
      ltd: coords.lat,
      lng: coords.lon,
    };
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  try {
    const [originCoords, destinationCoords] = await Promise.all([
      geocodeAddress(origin),
      geocodeAddress(destination),
    ]);

    // Try OSRM route API first for actual driving distance
    try {
      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destinationCoords.lon},${destinationCoords.lat}?overview=false`;
      const osrmResponse = await axiosInstance.get(osrmUrl, { timeout: 4000 });

      if (
        osrmResponse.data &&
        osrmResponse.data.routes &&
        osrmResponse.data.routes.length > 0
      ) {
        const route = osrmResponse.data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);

        return {
          distance: `${distanceKm} km`,
          distanceValue: route.distance, // in meters
          duration: `${durationMin} mins`,
          durationValue: route.duration, // in seconds
        };
      }
    } catch (osrmError) {
      console.warn(
        "OSRM routing API slow or down, switching to Haversine fallback",
      );
    }

    // Fallback: Calculate distance via Haversine
    const distanceKmVal = calculateHaversineDistance(
      originCoords.lat,
      originCoords.lon,
      destinationCoords.lat,
      destinationCoords.lon,
    );

    const distanceMeters = Math.round(distanceKmVal * 1000);
    // Estimated driving speed ~25 km/h in city traffic
    const durationSeconds = Math.round((distanceKmVal / 25) * 3600);
    const distanceKm = distanceKmVal.toFixed(1);
    const durationMin = Math.round(durationSeconds / 60);

    return {
      distance: `${distanceKm} km`,
      distanceValue: distanceMeters,
      duration: `${durationMin} mins`,
      durationValue: durationSeconds,
    };
  } catch (error) {
    console.error("Error fetching distance and time:", error.message);
    throw error;
  }
};

module.exports.getSuggestion = async (query) => {
  if (!query || query.trim().length === 0) return [];

  // 1. Try Photon API restricted to India (bbox: 68.1,6.5,97.4,35.5)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=68.1,6.5,97.4,35.5&limit=5`;
    const response = await axiosInstance.get(photonUrl, { timeout: 3000 });

    if (response.data?.features?.length > 0) {
      // Filter strictly to ensure country is India / IN
      const indiaFeatures = response.data.features.filter((feature) => {
        const c = feature.properties?.country?.toLowerCase();
        const code = feature.properties?.countrycode?.toLowerCase();
        if (!c && !code) return true;
        return c === "india" || code === "in";
      });

      return indiaFeatures.map((feature) => {
        const p = feature.properties;
        const coords = feature.geometry.coordinates;

        const parts = [];
        if (p.name) parts.push(p.name);
        if (p.street && p.street !== p.name) parts.push(p.street);
        if (p.district) parts.push(p.district);
        if (p.city && p.city !== p.name) parts.push(p.city);
        if (p.state) parts.push(p.state);
        if (p.country) parts.push(p.country);

        const displayName =
          parts.length > 0 ? parts.join(", ") : p.name || query;

        return {
          ltd: coords[1],
          lng: coords[0],
          display_name: displayName,
        };
      });
    }
  } catch (error) {
    console.warn(
      "Photon autocomplete failed, falling back to Nominatim",
      error.message,
    );
  }

  // 2. Nominatim fallback restricted strictly to India (countrycodes=in)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=5`;
    const response = await axiosInstance.get(url, {
      headers: { "User-Agent": "UberCloneApp/1.0" },
      timeout: 3000,
    });

    if (response.data && response.data.length > 0) {
      return response.data.map((item) => ({
        ltd: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
      }));
    }
  } catch (error) {
    console.error("Nominatim suggestion failed:", error.message);
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

