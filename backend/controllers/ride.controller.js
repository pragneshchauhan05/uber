const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMasegeToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");
const RideRequest = require("../models/rideRequest.model");
const captainRouteModel = require("../models/captainRoute.model");
const routeMatchingService = require("../services/routeMatching.service");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { pickup, destination, vehicleType } = req.body;
  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const pickupCordinets = await mapService.getAddressCoordinate(pickup);
    const captainsInRadius = await mapService.getCaptainInRadius(
      pickupCordinets.ltd || pickupCordinets.lat,
      pickupCordinets.lng,
      50,
    );

    const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate("user");
    rideWithUser.otp = "";

    captainsInRadius.map((captain) => {
      sendMasegeToSocketId(captain.socketId, {
        event: "ride_request",
        data: rideWithUser,
      });
    });

    return res.status(201).json({ message: "Ride created", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMasegeToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMasegeToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({
      rideId,
      captain: req.captain,
    });

    sendMasegeToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    const completedRides = await rideModel.find({
      captain: req.captain._id,
      status: "completed",
    });

    const totalEarnings = completedRides.reduce(
      (sum, r) => sum + (Number(r.fare) || 0),
      0
    );

    await captainModel.findByIdAndUpdate(req.captain._id, {
      earnings: totalEarnings,
    });

    const updatedCaptain = await captainModel.findById(req.captain._id);
    const captainObj = updatedCaptain ? updatedCaptain.toObject() : {};
    captainObj.earnings = totalEarnings;

    return res.status(200).json({ ride, captain: captainObj });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.cancelRide = async (req, res) => {
  const { rideId } = req.body;

  try {
    const ride = await rideModel
      .findById(rideId)
      .populate("user")
      .populate("captain");

    if (ride) {
      ride.status = "cancelled";
      await ride.save();

      if (ride.user && ride.user.socketId) {
        sendMasegeToSocketId(ride.user.socketId, {
          event: "ride-cancelled",
          data: ride,
        });
      }

      if (ride.captain && ride.captain.socketId) {
        sendMasegeToSocketId(ride.captain.socketId, {
          event: "ride-cancelled",
          data: ride,
        });
      }
    }

    return res.status(200).json({ message: "Ride cancelled successfully", ride });
  } catch (err) {
    console.error("Error cancelling ride:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createRideRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, drop, requestedDate, requestedTime } = req.body;

  try {
    let pickupAddress = typeof pickup === "object" ? pickup.address : pickup;
    let pickupLat = typeof pickup === "object" ? pickup.lat : null;
    let pickupLng = typeof pickup === "object" ? pickup.lng : null;

    if (!pickupLat || !pickupLng) {
      const pickupCoords = await mapService.getAddressCoordinate(pickupAddress);
      pickupLat = pickupCoords.ltd || pickupCoords.lat;
      pickupLng = pickupCoords.lng;
    }

    let dropAddress = typeof drop === "object" ? drop.address : drop;
    let dropLat = typeof drop === "object" ? drop.lat : null;
    let dropLng = typeof drop === "object" ? drop.lng : null;

    if (!dropLat || !dropLng) {
      const dropCoords = await mapService.getAddressCoordinate(dropAddress);
      dropLat = dropCoords.ltd || dropCoords.lat;
      dropLng = dropCoords.lng;
    }

    const rideRequest = await RideRequest.create({
      userId: req.user._id,
      pickup: {
        address: pickupAddress,
        lat: Number(pickupLat),
        lng: Number(pickupLng),
      },
      drop: {
        address: dropAddress,
        lat: Number(dropLat),
        lng: Number(dropLng),
      },
      pickupPoint: {
        type: "Point",
        coordinates: [Number(pickupLng), Number(pickupLat)],
      },
      dropPoint: {
        type: "Point",
        coordinates: [Number(dropLng), Number(dropLat)],
      },
      requestedDate,
      requestedTime,
      status: "SEARCHING",
    });

    // Find active captain routes that match this ride request and notify matching captains in real time
    try {
      const activeRoutes = await captainRouteModel
        .find({ status: "ACTIVE" })
        .populate("captain", "fullname fullName vehicle rating phone socketId");

      const matches = routeMatchingService.findMatchingRoutesForRide(rideRequest, activeRoutes);

      const userName =
        `${req.user.fullname?.firstname || req.user.fullname?.firstName || "User"} ${
          req.user.fullname?.lastname || req.user.fullname?.lastName || ""
        }`.trim() || "User";

      for (const match of matches) {
        const captainObj = activeRoutes.find(
          (r) => r._id.toString() === match.routeId.toString()
        )?.captain;

        if (captainObj && captainObj.socketId) {
          const notificationData = {
            rideRequestId: rideRequest._id,
            routeId: match.routeId,
            userName,
            userEmail: req.user.email,
            pickup: rideRequest.pickup.address,
            drop: rideRequest.drop.address,
            matchScore: match.matchScore,
            pickupDistance: match.pickupDistance,
            dropDistance: match.dropDistance,
            requestedDate: rideRequest.requestedDate,
            requestedTime: rideRequest.requestedTime,
          };

          sendMasegeToSocketId(captainObj.socketId, {
            event: "ride:matched",
            data: notificationData,
          });

          sendMasegeToSocketId(captainObj.socketId, {
            event: "ride:requested",
            data: notificationData,
          });
        }
      }
    } catch (matchErr) {
      console.error("Error broadcasting real-time ride match to captains:", matchErr);
    }

    return res.status(201).json({
      message: "Ride request created successfully",
      rideRequest,
    });
  } catch (error) {
    console.error("Error in createRideRequest:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getMyRides = async (req, res) => {
  try {
    const rides = await RideRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(rides);
  } catch (error) {
    console.error("Error in getMyRides:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getRideById = async (req, res) => {
  try {
    const ride = await RideRequest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ride) {
      return res.status(404).json({ message: "Ride request not found" });
    }
    return res.status(200).json(ride);
  } catch (error) {
    console.error("Error in getRideById:", error);
    return res.status(500).json({ message: error.message });
  }
};




