const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    pickup: {
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    drop: {
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    requestedDate: {
      type: String,
      required: true,
    },
    requestedTime: {
      type: String,
      required: true,
    },
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captain",
      default: null,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captainRoute",
      default: null,
    },
    status: {
      type: String,
      enum: ["SEARCHING", "MATCHED", "REQUESTED", "CONFIRMED", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "SEARCHING",
    },
    pickupPoint: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    dropPoint: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  {
    timestamps: true,
  }
);

rideRequestSchema.index({ pickupPoint: "2dsphere" });
rideRequestSchema.index({ dropPoint: "2dsphere" });

module.exports = mongoose.model("RideRequest", rideRequestSchema);
