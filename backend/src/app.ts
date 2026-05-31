import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { rateLimiter } from "./middleware/rate-limiter.js";
import { connectToDatabase } from "./db/connection.js";

config();
const app = express();
const saveRawBody = (
  req: express.Request,
  _res: express.Response,
  buffer: Buffer
) => {
  (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
};

// Security and CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    verify: saveRawBody,
  })
);
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
    verify: saveRawBody,
  })
);
app.use(cookieParser(process.env.COOKIE_SECRET));

// Logging middleware
app.use(morgan("combined"));

// Rate limiting middleware
app.use(
  rateLimiter({
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 50),
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// API routes
app.use("/api/v1", async (_req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error: any) {
    console.error("Database connection error:", error);
    res.status(503).json({
      success: false,
      message: "Database is not available. Please try again shortly.",
    });
  }
});
app.use("/api/v1", appRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
);

export default app;
