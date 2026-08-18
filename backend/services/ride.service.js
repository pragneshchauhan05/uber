const crypto = require("crypto");
const ridemodel = require("../models/ride.model");
const mapService = require("./maps.service");

// Fare rates per vehicle type (₹)
const FARE_RATES = {
  auto: {
    baseFare: 30, // ₹ flat base charge
    perKm: 12, // ₹ per km
    perMinute: 1.5, // ₹ per minute
  },
  car: {
    baseFare: 50, // ₹ flat base charge
    perKm: 18, // ₹ per km
    perMinute: 2, // ₹ per minute
  },
  motorcycle: {
    baseFare: 20, // ₹ flat base charge
    perKm: 8, // ₹ per km
    perMinute: 1, // ₹ per minute
  },
};

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  // Convert meters → km and seconds → minutes
  const distanceKm = distanceTime.distanceValue / 1000;
  const durationMin = distanceTime.durationValue / 60;

  // Calculate fare for each vehicle type
  const fares = {};
  for (const [vehicleType, rates] of Object.entries(FARE_RATES)) {
    const fare =
      rates.baseFare + rates.perKm * distanceKm + rates.perMinute * durationMin;

    fares[vehicleType] = Math.round(fare); // round to nearest ₹
  }

  const carMin = Math.max(1, Math.round(durationMin));
  const motoMin = Math.max(1, Math.round(durationMin * 0.85));
  const autoMin = Math.max(1, Math.round(durationMin * 1.1));

  return {
    ...fares,
    distance: distanceTime.distance,
    duration: distanceTime.duration,
    durationMinutes: {
      car: carMin,
      motorcycle: motoMin,
      auto: autoMin,
    },
    durationTimes: {
      car: `${carMin} mins away`,
      motorcycle: `${motoMin} mins away`,
      auto: `${autoMin} mins away`,
    },
  };
}

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const fares = await getFare(pickup, destination);
  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const ride = await ridemodel.create({
    user,
    pickup,
    destination,
    otp: getOtp(6),
    fare: fares[vehicleType],
    duration: distanceTime.durationValue,
    distance: distanceTime.distanceValue,
  });

  return ride;
};

module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  await ridemodel.findOneAndUpdate(
    { _id: rideId },
    {
      status: "accepted",
      captain: captain._id,
    },
  );

  const ride = await ridemodel
    .findOne({ _id: rideId })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and OTP are required");
  }

  const ride = await ridemodel
    .findOne({ _id: rideId })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await ridemodel.findOneAndUpdate(
    { _id: rideId },
    { status: "ongoing" },
  );

  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await ridemodel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  await ridemodel.findOneAndUpdate(
    { _id: rideId },
    { status: "completed" },
  );

  return ride;
};

module.exports.getFare = getFare;



