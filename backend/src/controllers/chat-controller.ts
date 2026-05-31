import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";

const DAILY_REVIEW_LIMIT = Number(process.env.DAILY_REVIEW_LIMIT || 5);

const getUtcDayStart = (date = new Date()) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};

const syncDailyReviewWindow = (user: {
  dailyReviewCount?: number;
  dailyReviewWindowStart?: Date | null;
}) => {
  const today = getUtcDayStart();
  const windowStart = user.dailyReviewWindowStart
    ? getUtcDayStart(user.dailyReviewWindowStart)
    : null;

  if (!windowStart || windowStart.getTime() !== today.getTime()) {
    user.dailyReviewCount = 0;
    user.dailyReviewWindowStart = today;
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({
        message: "User not registered or token is invalid",
        success: false,
      });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({
        message: "Insufficient permissions",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Reviews retrieved successfully",
      success: true,
      chats: user.chats,
      reviewsCount: user.reviewsCount,
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      message: "Error retrieving reviews",
      success: false,
      error: error.message,
    });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({
        message: "User not registered or token is invalid",
        success: false,
      });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({
        message: "Insufficient permissions",
        success: false,
      });
    }

    user.chats.splice(0, user.chats.length);
    user.reviewsCount = 0;
    await user.save();

    return res.status(200).json({
      message: "Reviews deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Delete reviews error:", error);
    return res.status(500).json({
      message: "Error deleting reviews",
      success: false,
      error: error.message,
    });
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({
        message: "User not registered or token is invalid",
        success: false,
      });
    }

    syncDailyReviewWindow(user);
    await user.save();

    const stats = {
      totalReviews: user.reviewsCount || 0,
      totalChats: user.chats.length,
      criticalIssues: user.chats.filter(
        (c) => c.severity === "critical"
      ).length,
      averageIssuesPerReview:
        user.reviewsCount > 0
          ? Math.round(
              user.chats.reduce((sum, c) => sum + (c.issuesCount || 0), 0) /
                user.reviewsCount
            )
          : 0,
      languagesReviewed: [
        ...new Set(
          user.chats
            .filter((c) => c.language && c.language !== "plain")
            .map((c) => c.language)
        ),
      ],
      dailyLimit: DAILY_REVIEW_LIMIT,
      dailyUsed: user.dailyReviewCount || 0,
      dailyRemaining: Math.max(DAILY_REVIEW_LIMIT - (user.dailyReviewCount || 0), 0),
    };

    return res.status(200).json({
      message: "Stats retrieved successfully",
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    return res.status(500).json({
      message: "Error retrieving stats",
      success: false,
      error: error.message,
    });
  }
};



