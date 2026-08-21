const captainRouteModel = require("../models/captainRoute.model");
const RideRequest = require("../models/rideRequest.model");
const userModel = require("../models/user.model");
const mapService = require("../services/maps.service");
const routeMatchingService = require("../services/routeMatching.service");
const { sendMasegeToSocketId } = require("../socket");
const { validationResult } = require("express-validator");

module.exports.createRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      startLocation,
      destination,
      routeCoordinates,
      departureDate,
      departureTime,
      availableSeats,
    } = req.body;

    let startLat = startLocation?.lat;
    let startLng = startLocation?.lng;

    if (!startLat || !startLng) {
      const startCoords = await mapService.getAddressCoordinate(startLocation.address);
      startLat = startCoords.ltd || startCoords.lat || 23.0225;
      startLng = startCoords.lng || 72.5714;
    }

    let destLat = destination?.lat;
    let destLng = destination?.lng;

    if (!destLat || !destLng) {
      const destCoords = await mapService.getAddressCoordinate(destination.address);
      destLat = destCoords.ltd || destCoords.lat || 23.0225;
      destLng = destCoords.lng || 72.5714;
    }

    // Default route coordinates connecting start and destination if array empty
    let finalRouteCoords = routeCoordinates || [];
    if (!finalRouteCoords.length) {
      finalRouteCoords = [
        { lat: Number(startLat), lng: Number(startLng) },
        { lat: Number(destLat), lng: Number(destLng) },
      ];
    }

    const newRoute = await captainRouteModel.create({
      captain: req.captain._id,
      startLocation: {
        address: startLocation.address,
        lat: Number(startLat),
        lng: Number(startLng),
      },
      destination: {
        address: destination.address,
        lat: Number(destLat),
        lng: Number(destLng),
      },
      startLocationPoint: {
        type: "Point",
        coordinates: [Number(startLng), Number(startLat)],
      },
      destinationPoint: {
        type: "Point",
        coordinates: [Number(destLng), Number(destLat)],
      },
      routeCoordinates: finalRouteCoords,
      departureDate,
      departureTime,
      availableSeats: Number(availableSeats),
      seatsBooked: 0,
      status: "ACTIVE",
    });

    return res.status(201).json({
      message: "Planned route published successfully",
      route: newRoute,
    });
  } catch (error) {
    console.error("Error creating captain route:", error);
    return res.status(500).json({ message: error.message || "Failed to create route" });
  }
};

module.exports.getMyRoutes = async (req, res) => {
  try {
    const routes = await captainRouteModel
      .find({ captain: req.captain._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ routes });
  } catch (error) {
    console.error("Error fetching captain routes:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch routes" });
  }
};

module.exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoute = await captainRouteModel.findOneAndDelete({
      _id: id,
      captain: req.captain._id,
    });

    if (!deletedRoute) {
      return res.status(404).json({ message: "Route not found or unauthorized" });
    }

    return res.status(200).json({ message: "Route deleted successfully", id });
  } catch (error) {
    console.error("Error deleting captain route:", error);
    return res.status(500).json({ message: error.message || "Failed to delete route" });
  }
};

module.exports.getAllActiveRoutes = async (req, res) => {
  try {
    const routes = await captainRouteModel
      .find({ status: "ACTIVE" })
      .populate("captain", "fullname fullName vehicle rating phone earnings socketId")
      .sort({ departureDate: 1, departureTime: 1 });

    return res.status(200).json({ routes });
  } catch (error) {
    console.error("Error fetching all active captain routes:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch active routes" });
  }
};

module.exports.bookCaptainRoute = async (req, res) => {
  try {
    const { routeId, rideRequestId } = req.body;
    const route = await captainRouteModel.findById(routeId).populate("captain");

    if (!route) {
      return res.status(404).json({ message: "Captain route not found" });
    }

    if (route.availableSeats <= route.seatsBooked) {
      return res.status(400).json({ message: "No seats available on this route" });
    }

    route.seatsBooked += 1;
    await route.save();

    let updatedRideRequest = null;
    if (rideRequestId && mongoose.Types.ObjectId.isValid(rideRequestId)) {
      updatedRideRequest = await RideRequest.findByIdAndUpdate(
        rideRequestId,
        {
          status: "ACCEPTED",
          captainId: route.captain._id,
        },
        { new: true }
      );
    }

    return res.status(200).json({
      message: "Seat booked successfully on captain route",
      route,
      rideRequest: updatedRideRequest,
    });
  } catch (error) {
    console.error("Error booking captain route:", error);
    return res.status(500).json({ message: error.message || "Failed to book captain route" });
  }
};

const mongoose = require("mongoose");

module.exports.getMatchingRoutes = async (req, res) => {
  try {
    const { rideId } = req.params;

    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: "Invalid or missing Ride ID" });
    }

    const rideRequest = await RideRequest.findById(rideId);
    if (!rideRequest) {
      return res.status(404).json({ message: "Ride request not found" });
    }

    // Fetch candidate active captain routes
    const activeRoutes = await captainRouteModel
      .find({ status: "ACTIVE" })
      .populate("captain", "fullname fullName vehicle rating phone earnings socketId");

    const matches = routeMatchingService.findMatchingRoutesForRide(
      rideRequest,
      activeRoutes
    );

    return res.status(200).json(matches);
  } catch (error) {
    console.error("Error finding matching captain routes:", error);
    return res.status(500).json({ message: error.message || "Failed to find matching routes" });
  }
};

module.exports.getCaptainRouteMatches = async (req, res) => {
  try {
    const { routeId } = req.params;

    if (!routeId || !mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ message: "Invalid or missing Route ID" });
    }

    const captainRoute = await captainRouteModel.findById(routeId);
    if (!captainRoute) {
      return res.status(404).json({ message: "Captain route not found" });
    }

    // Ownership check: Only captain who owns this route can view matches
    if (captainRoute.captain.toString() !== req.captain._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this captain route" });
    }

    // Fetch candidate active searching ride requests
    const candidateRides = await RideRequest.find({ status: "SEARCHING" }).populate(
      "userId",
      "fullname fullName email"
    );

    const matches = routeMatchingService.findMatchingRidesForCaptainRoute(
      captainRoute,
      candidateRides
    );

    return res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matching rides for captain route:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch matching rides" });
  }
};

module.exports.acceptRideRequest = async (req, res) => {
  try {
    const { routeId, rideRequestId } = req.body;

    if (!routeId || !mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ message: "Invalid or missing routeId" });
    }
    if (!rideRequestId || !mongoose.Types.ObjectId.isValid(rideRequestId)) {
      return res.status(400).json({ message: "Invalid or missing rideRequestId" });
    }

    // 1. Verify route existence & captain ownership
    const route = await captainRouteModel.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: "Captain route not found" });
    }

    if (route.captain.toString() !== req.captain._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this captain route" });
    }

    // 2. Check if Ride Request is already confirmed by another captain
    const existingRideReq = await RideRequest.findById(rideRequestId);
    if (!existingRideReq) {
      return res.status(404).json({ message: "Ride request not found" });
    }

    if (
      existingRideReq.status === "CONFIRMED" ||
      existingRideReq.status === "ACCEPTED" ||
      existingRideReq.status === "COMPLETED"
    ) {
      return res.status(409).json({
        message: "This ride request has already been confirmed or accepted by another Captain.",
        status: existingRideReq.status,
      });
    }

    // 3. Atomic Seat Check & Increment on Captain Route
    const updatedRoute = await captainRouteModel.findOneAndUpdate(
      {
        _id: routeId,
        captain: req.captain._id,
        status: "ACTIVE",
        $expr: { $lt: ["$seatsBooked", "$availableSeats"] },
      },
      { $inc: { seatsBooked: 1 } },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(400).json({
        message: "No available seats remaining on this route.",
      });
    }

    // 4. Atomic Ride Request Status Update to CONFIRMED
    const confirmedRideRequest = await RideRequest.findOneAndUpdate(
      {
        _id: rideRequestId,
        status: { $in: ["SEARCHING", "MATCHED", "REQUESTED"] },
      },
      {
        status: "CONFIRMED",
        captainId: req.captain._id,
        routeId: routeId,
      },
      { new: true }
    );

    // If another captain confirmed it concurrently between step 2 and step 4, rollback seat increment
    if (!confirmedRideRequest) {
      await captainRouteModel.findByIdAndUpdate(routeId, { $inc: { seatsBooked: -1 } });
      return res.status(409).json({
        message: "This ride request was just confirmed by another Captain.",
      });
    }

    // 5. Notify user in real time via Socket.IO
    try {
      const riderUser = await userModel.findById(confirmedRideRequest.userId);
      if (riderUser && riderUser.socketId) {
        const captainName =
          `${req.captain.fullname?.firstname || req.captain.fullname?.firstName || "Captain"} ${
            req.captain.fullname?.lastname || req.captain.fullname?.lastName || ""
          }`.trim() || "Captain";

        const notificationData = {
          rideRequestId: confirmedRideRequest._id,
          routeId: updatedRoute._id,
          captainId: req.captain._id,
          captainName,
          startLocation: updatedRoute.startLocation?.address,
          destination: updatedRoute.destination?.address,
          departureDate: updatedRoute.departureDate,
          departureTime: updatedRoute.departureTime,
          vehicle: req.captain.vehicle,
          status: "CONFIRMED",
        };

        sendMasegeToSocketId(riderUser.socketId, {
          event: "ride:confirmed",
          data: notificationData,
        });

        sendMasegeToSocketId(riderUser.socketId, {
          event: "ride:accepted",
          data: notificationData,
        });
      }
    } catch (socketErr) {
      console.error("Error sending socket notification to user:", socketErr);
    }

    return res.status(200).json({
      message: "Ride request confirmed successfully",
      route: updatedRoute,
      rideRequest: confirmedRideRequest,
    });
  } catch (error) {
    console.error("Error accepting ride request:", error);
    return res.status(500).json({ message: error.message || "Failed to accept ride request" });
  }
};

module.exports.rejectRideRequest = async (req, res) => {
  try {
    const { routeId, rideRequestId } = req.body;

    if (!rideRequestId || !mongoose.Types.ObjectId.isValid(rideRequestId)) {
      return res.status(400).json({ message: "Invalid rideRequestId" });
    }

    if (routeId && mongoose.Types.ObjectId.isValid(routeId)) {
      const route = await captainRouteModel.findById(routeId);
      if (route && route.captain.toString() !== req.captain._id.toString()) {
        return res.status(403).json({ message: "Unauthorized access to this captain route" });
      }
    }

    const updatedRideRequest = await RideRequest.findByIdAndUpdate(
      rideRequestId,
      { status: "CANCELLED" },
      { new: true }
    );

    // Notify user via Socket.IO in real time
    try {
      if (updatedRideRequest && updatedRideRequest.userId) {
        const riderUser = await userModel.findById(updatedRideRequest.userId);
        if (riderUser && riderUser.socketId) {
          sendMasegeToSocketId(riderUser.socketId, {
            event: "ride:rejected",
            data: { rideRequestId: updatedRideRequest._id },
          });
        }
      }
    } catch (socketErr) {
      console.error("Error sending ride:rejected socket notification to user:", socketErr);
    }

    return res.status(200).json({
      message: "Ride request rejected",
      rideRequest: updatedRideRequest,
    });
  } catch (error) {
    console.error("Error rejecting ride request:", error);
    return res.status(500).json({ message: error.message || "Failed to reject ride request" });
  }
};
