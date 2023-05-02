import mongoose from "mongoose";
import config from "./configurations/config.js";

// Throw uncaught exception before app begins to run
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app.js";

// Connect to database
let DATABASE = config.db.dev;
// Environment
let env = config.env;
if (env === "production") DATABASE = config.db.prod;
if (env === "test") DATABASE = config.db.test;

mongoose
  .connect(DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connection successfull....");
  })
  .catch((err) => {
    console.log("Unable to connect to database:💥 ", err.message);
  });

// Launch server
const server = app.listen(config.port, () => {
  console.log(`App running on port ${config.port}....`);
});

// Throw unhandled rejection after app runs
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLER REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

export default server;
