import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number; // in milliseconds
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const maxRequests = options.maxRequests || 30; // 30 requests per window
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    // Reset if window has expired
    if (now > store[key].resetTime) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - store[key].count);
    res.setHeader(
      "X-RateLimit-Reset",
      new Date(store[key].resetTime).toISOString()
    );

    next();
  };
};

// Cleanup old entries periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime + 60000) {
      // Keep for 1 minute after reset
      delete store[key];
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

cleanupTimer.unref();
