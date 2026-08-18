const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blackListToken");

module.exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, fullname, password } = req.body;

    const isUserExists = await userModel.findOne({ email });
    if (isUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
      email,
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      password: hashedPassword,
    });
    const token = user.generateAuthToken();
    return res.status(201).json({ user, token });
  } catch (error) {
    console.error("Register user error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports.loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = user.generateAuthToken();
    return res.status(200).json({ user, token });
  } catch (error) {
    console.error("Login user error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token");
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      await blacklistTokenModel.create({ token });
    }
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout user error:", error);
    return res.status(500).json({ message: error.message });
  }
};
