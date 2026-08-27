const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require("./models/ride.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
      } else if (userType === "captain") {
        await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (!location || (!location.ltd && !location.lat) || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      const lat = Number(location.lat || location.ltd);
      const lng = Number(location.lng);

      await captainModel.findByIdAndUpdate(userId, {
        location: {
          ltd: lat,
          lat,
          lng,
        },
      });

      // Relay captain location to rider if captain is in an active ride
      try {
        const activeRide = await rideModel
          .findOne({ captain: userId, status: { $in: ["accepted", "ongoing"] } })
          .populate("user");

        if (activeRide && activeRide.user && activeRide.user.socketId) {
          sendMessageToSocketId(activeRide.user.socketId, {
            event: "captain-location-updated",
            data: { captainId: userId, location: { lat, lng } },
          });
        }
      } catch (err) {
        console.error("Error relaying captain location:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  console.log(messageObject);

  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  sendMasegeToSocketId: sendMessageToSocketId,
};
