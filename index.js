// Entry point for Stampcoin Platform
// Starts the main server
"use strict";

const { startServer } = require("./server");

try {
  startServer();
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}
