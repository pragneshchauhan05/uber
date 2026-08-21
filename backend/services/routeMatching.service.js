/**
 * Service for Captain Route Matching Algorithm
 */

const ROUTE_MATCH_RADIUS = 500; // meters
const MAX_TIME_DIFF_MINUTES = 60; // minutes

/**
 * Calculates the Haversine distance between two coordinates in meters.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
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

/**
 * Finds the closest point on segment AB from point P, and returns distance & parameter t.
 */
function closestPointOnSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const dx = bLng - aLng;
  const dy = bLat - aLat;

  if (dx === 0 && dy === 0) {
    return {
      lat: aLat,
      lng: aLng,
      t: 0,
      distance: haversineDistance(pLat, pLng, aLat, aLng),
    };
  }

  let t = ((pLng - aLng) * dx + (pLat - aLat) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  const cLat = aLat + t * dy;
  const cLng = aLng + t * dx;
  const distance = haversineDistance(pLat, pLng, cLat, cLng);

  return { lat: cLat, lng: cLng, t, distance };
}

/**
 * Calculates the minimum distance from a point to a polyline,
 * and the cumulative distance along the polyline to that closest point.
 */
function getPointPolylineProximity(pointLat, pointLng, routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    return { minDistance: Infinity, distAlongRoute: 0 };
  }

  if (routeCoordinates.length === 1) {
    const dist = haversineDistance(
      pointLat,
      pointLng,
      routeCoordinates[0].lat,
      routeCoordinates[0].lng
    );
    return { minDistance: dist, distAlongRoute: 0 };
  }

  let minDistance = Infinity;
  let distAlongRoute = 0;
  let accumulatedDist = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const pA = routeCoordinates[i];
    const pB = routeCoordinates[i + 1];
    const segmentLength = haversineDistance(pA.lat, pA.lng, pB.lat, pB.lng);

    const closest = closestPointOnSegment(
      pointLat,
      pointLng,
      pA.lat,
      pA.lng,
      pB.lat,
      pB.lng
    );

    if (closest.distance < minDistance) {
      minDistance = closest.distance;
      distAlongRoute = accumulatedDist + closest.t * segmentLength;
    }

    accumulatedDist += segmentLength;
  }

  return { minDistance, distAlongRoute };
}

/**
 * Parses time string (e.g. "10:30", "10:30 AM", "22:15") into total minutes from midnight.
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  let str = timeStr.trim().toUpperCase();
  const isPM = str.includes("PM");
  const isAM = str.includes("AM");

  str = str.replace(/AM|PM/g, "").trim();
  const parts = str.split(":");
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Calculates absolute time difference in minutes between two time strings.
 */
function getTimeDifferenceMinutes(timeStr1, timeStr2) {
  const min1 = parseTimeToMinutes(timeStr1);
  const min2 = parseTimeToMinutes(timeStr2);
  const diff = Math.abs(min1 - min2);
  return Math.min(diff, 1440 - diff); // handle midnight wrap-around
}

/**
 * Normalizes date string into YYYY-MM-DD for comparison.
 */
function normalizeDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch (e) {
    // fallback to string trim
  }
  return dateStr.trim();
}

/**
 * Calculates match score percentage (0 to 100).
 */
function calculateMatchScore(pickupDistance, dropDistance, timeDifference) {
  const avgDistance = (pickupDistance + dropDistance) / 2;
  
  // Penalties relative to maximum allowed thresholds
  const distPenalty = (avgDistance / ROUTE_MATCH_RADIUS) * 15; // Max 15% penalty
  const timePenalty = (timeDifference / MAX_TIME_DIFF_MINUTES) * 15; // Max 15% penalty

  const score = Math.round(100 - distPenalty - timePenalty);
  return Math.min(100, Math.max(1, score));
}

/**
 * Main matching algorithm function.
 */
function findMatchingRoutesForRide(rideRequest, captainRoutes) {
  const matches = [];

  const pickupLat = rideRequest.pickup?.lat;
  const pickupLng = rideRequest.pickup?.lng;
  const dropLat = rideRequest.drop?.lat;
  const dropLng = rideRequest.drop?.lng;
  const reqDate = normalizeDate(rideRequest.requestedDate);
  const reqTime = rideRequest.requestedTime;

  if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
    return [];
  }

  for (const route of captainRoutes) {
    // 1. Status Check
    if (route.status !== "ACTIVE") continue;

    // 2. Seats Availability Check
    const seatsRemaining = (route.availableSeats || 0) - (route.seatsBooked || 0);
    if (seatsRemaining <= 0) continue;

    // 3. Date Match Check
    const depDate = normalizeDate(route.departureDate);
    if (reqDate && depDate && reqDate !== depDate) continue;

    // 4. Time Match Check
    const timeDiff = getTimeDifferenceMinutes(reqTime, route.departureTime);
    if (timeDiff > MAX_TIME_DIFF_MINUTES) continue;

    // 5. Polyline Distance & Direction Match
    let polyline = route.routeCoordinates || [];
    if (!polyline.length && route.startLocation && route.destination) {
      polyline = [
        { lat: route.startLocation.lat, lng: route.startLocation.lng },
        { lat: route.destination.lat, lng: route.destination.lng },
      ];
    }

    const pickupProx = getPointPolylineProximity(pickupLat, pickupLng, polyline);
    const dropProx = getPointPolylineProximity(dropLat, dropLng, polyline);

    // Pickup & Drop must both be within 500m of Captain's polyline
    if (pickupProx.minDistance > ROUTE_MATCH_RADIUS) continue;
    if (dropProx.minDistance > ROUTE_MATCH_RADIUS) continue;

    // Direction check: User pickup must be BEFORE drop along Captain's route
    if (pickupProx.distAlongRoute >= dropProx.distAlongRoute) continue;

    // Calculate match score
    const pickupDistance = Math.round(pickupProx.minDistance);
    const dropDistance = Math.round(dropProx.minDistance);
    const matchScore = calculateMatchScore(pickupDistance, dropDistance, timeDiff);

    const captain = route.captain || {};
    const firstName = captain.fullname?.firstname || captain.fullName?.firstName || captain.firstname || "";
    const lastName = captain.fullname?.lastname || captain.fullName?.lastName || captain.lastname || "";
    const captainName = `${firstName} ${lastName}`.trim() || "Captain";

    matches.push({
      routeId: route._id,
      captainId: captain._id || route.captain,
      captainName,
      startLocation: route.startLocation,
      destination: route.destination,
      departureDate: route.departureDate,
      departureTime: route.departureTime,
      pickupDistance,
      dropDistance,
      matchScore,
      availableSeats: seatsRemaining,
    });
  }

  // Sort by highest matchScore descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

/**
 * Reverse matching algorithm: Finds active User ride requests that match a specific Captain route.
 */
function findMatchingRidesForCaptainRoute(captainRoute, rideRequests) {
  const matches = [];

  if (!captainRoute || captainRoute.status !== "ACTIVE") {
    return [];
  }

  let polyline = captainRoute.routeCoordinates || [];
  if (!polyline.length && captainRoute.startLocation && captainRoute.destination) {
    polyline = [
      { lat: captainRoute.startLocation.lat, lng: captainRoute.startLocation.lng },
      { lat: captainRoute.destination.lat, lng: captainRoute.destination.lng },
    ];
  }

  const depDate = normalizeDate(captainRoute.departureDate);
  const depTime = captainRoute.departureTime;

  for (const rideReq of rideRequests) {
    if (rideReq.status !== "SEARCHING") continue;

    const pickupLat = rideReq.pickup?.lat;
    const pickupLng = rideReq.pickup?.lng;
    const dropLat = rideReq.drop?.lat;
    const dropLng = rideReq.drop?.lng;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng) continue;

    // 1. Date Match Check
    const reqDate = normalizeDate(rideReq.requestedDate);
    if (reqDate && depDate && reqDate !== depDate) continue;

    // 2. Time Match Check
    const timeDiff = getTimeDifferenceMinutes(rideReq.requestedTime, depTime);
    if (timeDiff > MAX_TIME_DIFF_MINUTES) continue;

    // 3. Polyline Distance & Direction Match
    const pickupProx = getPointPolylineProximity(pickupLat, pickupLng, polyline);
    const dropProx = getPointPolylineProximity(dropLat, dropLng, polyline);

    if (pickupProx.minDistance > ROUTE_MATCH_RADIUS) continue;
    if (dropProx.minDistance > ROUTE_MATCH_RADIUS) continue;

    // User pickup must come BEFORE user drop along Captain's polyline
    if (pickupProx.distAlongRoute >= dropProx.distAlongRoute) continue;

    const pickupDistance = Math.round(pickupProx.minDistance);
    const dropDistance = Math.round(dropProx.minDistance);
    const matchScore = calculateMatchScore(pickupDistance, dropDistance, timeDiff);

    const userObj = rideReq.userId || {};
    const firstName = userObj.fullname?.firstname || userObj.fullName?.firstName || userObj.firstname || "User";
    const lastName = userObj.fullname?.lastname || userObj.fullName?.lastName || userObj.lastname || "";
    const userName = `${firstName} ${lastName}`.trim() || "User";

    matches.push({
      rideRequestId: rideReq._id,
      userId: userObj._id || rideReq.userId,
      userName,
      userEmail: userObj.email || "",
      pickup: rideReq.pickup,
      drop: rideReq.drop,
      requestedDate: rideReq.requestedDate,
      requestedTime: rideReq.requestedTime,
      pickupDistance,
      dropDistance,
      matchScore,
      status: rideReq.status,
    });
  }

  // Sort by highest matchScore descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

module.exports = {
  ROUTE_MATCH_RADIUS,
  MAX_TIME_DIFF_MINUTES,
  haversineDistance,
  closestPointOnSegment,
  getPointPolylineProximity,
  parseTimeToMinutes,
  getTimeDifferenceMinutes,
  normalizeDate,
  calculateMatchScore,
  findMatchingRoutesForRide,
  findMatchingRidesForCaptainRoute,
};
