import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

const getCookieDomain = (): string | undefined => {
  const domain = process.env.COOKIE_DOMAIN?.trim();

  if (
    !domain ||
    domain === "localhost" ||
    domain.includes("://") ||
    domain.includes("yourdomain.com")
  ) {
    return undefined;
  }

  return domain.startsWith(".") ? domain : `.${domain}`;
};

const getCookieOptions = (expires?: Date) => {
  return {
    path: "/",
    domain: getCookieDomain(),
    expires,
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create token
    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Set cookie
    res.clearCookie(COOKIE_NAME, getCookieOptions());
    res.cookie(COOKIE_NAME, token, getCookieOptions(expires));

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during signup",
      error: error.message,
    });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // Verify password
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // Create token
    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Set cookie
    res.clearCookie(COOKIE_NAME, getCookieOptions());
    res.cookie(COOKIE_NAME, token, getCookieOptions(expires));

    return res.status(200).json({
      success: true,
      message: "Login successful",
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token is invalid",
      });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User verified",
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Verify user error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying user",
      error: error.message,
    });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token is invalid",
      });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.clearCookie(COOKIE_NAME, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};
