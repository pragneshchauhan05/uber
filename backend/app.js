const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectToDB = require("./db/db");
const userRoutes = require("./routes/user.routes");
const cookieParser = require("cookie-parser");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const captainRouteRoutes = require("./routes/captainRoute.routes");

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser());

connectToDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Uber Clone API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/routes", captainRouteRoutes);
app.use("/routes", captainRouteRoutes);
app.use("/api/captain/routes", captainRouteRoutes);

module.exports = app;
