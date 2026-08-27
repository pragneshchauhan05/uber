const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "captain",
  },
  pickup: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "arrived", "cancelled", "ongoing", "completed"],
    default: "pending",
  },
  duration: {
    type: Number,
    required: true,
  }, //in seconds
  distance: {
    type: Number,
    required: true,
  }, //in meters
  paymentId: {
    type: String,
    default: "",
  },
  orderId: {
    type: String,
    default: "",
  },
  signature: {
    type: String,
    default: "",
  },
  otp: {
    type: String,
    select: false,
    required: true,
  },
});

module.exports = mongoose.model("ride", rideSchema);
