const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./socket");

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

initializeSocket(server);

// Bind explicitly to 0.0.0.0 for Render, Heroku, Railway, and Cloud deployments
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running and listening on 0.0.0.0:${PORT}`);
});
