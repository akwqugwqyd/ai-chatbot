import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "defaultSecret";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "7d";

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  Warning: JWT_SECRET not set in environment. Using default secret - NOT SECURE FOR PRODUCTION!"
  );
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export const createToken = (
  id: string,
  email: string,
  expiresIn: string | number = TOKEN_EXPIRY
): string => {
  const payload: TokenPayload = { id, email };
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
    issuer: "code-review-api",
    audience: "code-review-client",
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.signedCookies[`${COOKIE_NAME}`];

    if (!token || typeof token !== "string" || token.trim() === "") {
      res.status(401).json({
        success: false,
        message: "Authentication token not found. Please log in.",
      });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.status(401).json({
            success: false,
            message: "Session expired. Please log in again.",
          });
          return;
        }
        if (err.name === "JsonWebTokenError") {
          res.status(401).json({
            success: false,
            message: "Invalid authentication token.",
          });
          return;
        }
        res.status(401).json({
          success: false,
          message: "Authentication failed.",
        });
        return;
      }

      res.locals.jwtData = decoded as TokenPayload;
      next();
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

 