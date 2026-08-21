const mongoose = require("mongoose");

const captainRouteSchema = new mongoose.Schema(
  {
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captain",
      required: true,
    },
    startLocation: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destination: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    routeCoordinates: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],
    departureDate: { type: String, required: true },
    departureTime: { type: String, required: true },
    availableSeats: { type: Number, required: true, min: 1 },
    seatsBooked: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
    startLocationPoint: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    destinationPoint: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

captainRouteSchema.index({ startLocationPoint: "2dsphere" });
captainRouteSchema.index({ destinationPoint: "2dsphere" });

module.exports = mongoose.model("captainRoute", captainRouteSchema);
