import queryRouter from "./routes/query.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./database.js";


import ingestRouter from "./routes/ingest.js";
import itemsRouter from "./routes/items.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();

    res.status(200).json({
      success: true,
      message: "AI Knowledge Inbox backend is running",
      database: "connected",
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      event: "health_check_failed",
      message: error.message,
    }));

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// API routes
app.use("/ingest", ingestRouter);
app.use("/items", itemsRouter);
app.use("/query", queryRouter);

// Handle unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

// Central error handler
app.use((error, req, res, next) => {
  console.error(JSON.stringify({
    level: "error",
    event: "request_failed",
    method: req.method,
    path: req.path,
    message: error.message,
    timestamp: new Date().toISOString(),
  }));

  if (res.headersSent) {
    return next(error);
  }

  const status =
    error.name === "AbortError" || error.name === "TimeoutError"
      ? 504
      : error.message.startsWith("Unable to fetch webpage:")
        ? 502
        : 500;

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? "An unexpected server error occurred."
        : error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: "info",
    event: "server_started",
    port: PORT,
    timestamp: new Date().toISOString(),
  }));
});
