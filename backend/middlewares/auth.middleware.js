const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blackListToken");
const jwt = require("jsonwebtoken");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const blacklistedToken = await blacklistTokenModel.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message || "Unauthorized" });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const blacklistedToken = await blacklistTokenModel.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded._id);
    if (!captain) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.captain = captain;
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message || "Unauthorized" });
  }
};
