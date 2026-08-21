const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const captainRouteController = require("../controllers/captainRoute.controller");
const { authCaptain, authUser } = require("../middlewares/auth.middleware");

// POST /api/routes - Create & publish planned route
router.post(
  "/",
  authCaptain,
  [
    body("startLocation.address").notEmpty().withMessage("Start location address is required"),
    body("destination.address").notEmpty().withMessage("Destination address is required"),
    body("departureDate").notEmpty().withMessage("Departure date is required"),
    body("departureTime").notEmpty().withMessage("Departure time is required"),
    body("availableSeats").isInt({ min: 1 }).withMessage("Available seats must be at least 1"),
  ],
  captainRouteController.createRoute
);

// GET /api/routes/my-routes - Get captain's published routes
router.get("/my-routes", authCaptain, captainRouteController.getMyRoutes);

// GET /api/routes/all - Get all active published captain routes for users
router.get("/all", captainRouteController.getAllActiveRoutes);

// POST /api/routes/book - Book a seat on a captain's route
router.post("/book", authUser, captainRouteController.bookCaptainRoute);

// GET /api/routes/matches/:rideId - Find Captain routes matching a User ride request
router.get("/matches/:rideId", captainRouteController.getMatchingRoutes);

// GET /api/captain/routes/:routeId/matches - Captain views matching User ride requests
router.get("/:routeId/matches", authCaptain, captainRouteController.getCaptainRouteMatches);

// POST /api/routes/accept-ride - Captain accepts a matching User ride request
router.post("/accept-ride", authCaptain, captainRouteController.acceptRideRequest);

// POST /api/routes/reject-ride - Captain rejects a matching User ride request
router.post("/reject-ride", authCaptain, captainRouteController.rejectRideRequest);

// DELETE /api/routes/:id - Delete a published route
router.delete("/:id", authCaptain, captainRouteController.deleteRoute);

module.exports = router;
