const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const blacklistTokenModel = require("../models/blackListToken");
const rideModel = require("../models/ride.model");
const { validationResult } = require("express-validator");

module.exports.registerCaptain = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, fullname, password, vehicle } = req.body;

    const isCaptainExists = await captainModel.findOne({ email });
    if (isCaptainExists) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    const hashedPassword = await captainModel.hashPassword(password);
    const captain = await captainService.createCaptain(
      fullname.firstname,
      fullname.lastname,
      email,
      hashedPassword,
      vehicle.vehicleType,
      vehicle.color,
      vehicle.plate,
      vehicle.capacity,
    );
    const token = captain.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ token, captain });
  } catch (error) {
    console.error("Captain registration error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports.loginCaptain = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = captain.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ token, captain });
  } catch (error) {
    console.error("Captain login error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports.getCaptainProfile = async (req, res) => {
  try {
    const completedRides = await rideModel.find({
      captain: req.captain._id,
      status: "completed",
    });
    const calculatedEarnings = completedRides.reduce(
      (sum, r) => sum + (Number(r.fare) || 0),
      0
    );

    const captainObj = req.captain.toObject ? req.captain.toObject() : { ...req.captain };
    captainObj.earnings = calculatedEarnings;

    return res.status(200).json({ captain: captainObj });
  } catch (err) {
    console.error("Error in getCaptainProfile:", err);
    return res.status(200).json({ captain: req.captain });
  }
};

module.exports.logoutCaptain = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await blacklistTokenModel.create({ token });
    }

    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Captain logout error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
