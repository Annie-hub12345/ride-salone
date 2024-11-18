const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const EXPRESS_PORT = 3000;
const WEBSOCKET_PORT = 8080;

// Store driver locations
let drivers = {};

// Create WebSocket server bound to all interfaces
const wss = new WebSocketServer({ port: WEBSOCKET_PORT, host: "0.0.0.0" });

// Log when the WebSocket server starts listening
wss.on("listening", () => {
  console.log(`WebSocket server is running on ws://0.0.0.0:${WEBSOCKET_PORT}`);
});

// Error handling for WebSocket server startup
wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New WebSocket connection from ${ip}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data); // Debugging line

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        };
        console.log("Updated driver location:", drivers[data.driver]); // Debugging line
      }

      if (data.type === "requestRide" && data.role === "user") {
        console.log("Requesting ride...");
        const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
        ws.send(
          JSON.stringify({ type: "nearbyDrivers", drivers: nearbyDrivers })
        );
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      // Send error back to client
      ws.send(JSON.stringify({ type: "error", message: error.message }));
    }
  });

  ws.on("close", (code, reason) => {
    console.log(
      `WebSocket connection closed from ${ip}. Code: ${code}, Reason: ${reason}`
    );
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error from ${ip}:`, error);
  });

  // Optionally, send a welcome message
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server",
    })
  );
});

const findNearbyDrivers = (userLat, userLon) => {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= 5000; // 5 kilometers
    })
    .map(([id, location]) => ({ id, ...location }));
};

// Error handling for Express server startup
app.listen(EXPRESS_PORT, (error) => {
  if (error) {
    console.error("Express server failed to start:", error);
  } else {
    console.log(`Express server is running on port ${EXPRESS_PORT}`);
  }
});

app.on("error", (error) => {
  console.error("Express server error:", error);
});
