const captainRouteModel = require("../models/captainRoute.model");
const mapService = require("../services/maps.service");
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
