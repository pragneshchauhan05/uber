const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getAddressCoordinate,
  getDistanceTime,
  getSuggestion,
} = require("../controllers/map.conroller");
const { query } = require("express-validator");

router.get(
  "/get-coordinates",
  //   authMiddleware.authUser,
  query("address").isString().notEmpty().withMessage("Address is required"),
  getAddressCoordinate,
);

router.get(
  "/get-distance-time",
  //   authMiddleware.authUser, // TODO: re-enable auth before production
  query("origin").isString().notEmpty().withMessage("Origin is required"),
  query("destination")
    .isString()
    .notEmpty()
    .withMessage("Destination is required"),
  getDistanceTime,
);

router.get(
  "/get-suggestion",
  query("input").isString().notEmpty().withMessage("Input query is required"),
  getSuggestion,
);

module.exports = router;
