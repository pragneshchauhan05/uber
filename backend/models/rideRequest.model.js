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
    status: {
      type: String,
      enum: ["SEARCHING", "ACCEPTED", "CANCELLED", "COMPLETED"],
      default: "SEARCHING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RideRequest", rideRequestSchema);
