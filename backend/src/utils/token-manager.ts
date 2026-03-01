import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "defaultSecret";

export const createToken = (
  id: string,
  email: string,
  expiresIn: string | number
) => {
  const payload = { id, email };
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] }; // ✅ cast to correct type
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[`${COOKIE_NAME}`];
  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token Expired" });
    }
    res.locals.jwtData = decoded;
    return next();
  });
};
 