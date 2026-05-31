import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import {
  chatCompletionValidator,
  codeReviewValidator,
  githubPrReviewValidator,
  validate,
} from "../utils/validators.js";
import {
  deleteChats,
  sendChatsToUser,
  getStats,
} from "../controllers/chat-controller.js";
import {
  reviewGithubPullRequest,
  reviewCode,
} from "../controllers/code-review-controller.js";

const chatRoutes = Router();

// Legacy chat endpoint
chatRoutes.post(
  "/new",
  validate(chatCompletionValidator),
  verifyToken,
  (req, res) => {
    return res.status(410).json({
      success: false,
      message:
        "General chat is deprecated. Please use the code review endpoint.",
    });
  }
);

// Code review endpoint
chatRoutes.post(
  "/review",
  validate(codeReviewValidator),
  verifyToken,
  reviewCode
);

chatRoutes.post(
  "/review/github-pr",
  validate(githubPrReviewValidator),
  verifyToken,
  reviewGithubPullRequest
);

// Get all reviews/chats
chatRoutes.get("/all-chats", verifyToken, sendChatsToUser);

// Delete all reviews/chats
chatRoutes.delete("/delete", verifyToken, deleteChats);

// Get user statistics
chatRoutes.get("/stats", verifyToken, getStats);

export default chatRoutes;
