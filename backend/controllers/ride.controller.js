const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMasegeToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");

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




