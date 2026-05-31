import mongoose from "mongoose";
import { randomUUID } from "crypto";

export interface CodeReview {
  id: string;
  role: "user" | "assistant";
  content: string;
  code: string | null;
  language: string | null;
  fileName: string | null;
  timestamp: Date;
  severity: "critical" | "high" | "medium" | "low" | "info" | null;
  issuesCount: number;
}

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  chats: mongoose.Types.DocumentArray<CodeReview & mongoose.Types.Subdocument>;
  reviewsCount: number;
  dailyReviewCount: number;
  dailyReviewWindowStart: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const codeReviewSchema = new mongoose.Schema({
  id: {
    type: String,
    default: randomUUID,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "assistant"],
  },
  content: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    default: null,
  },
  language: {
    type: String,
    default: "plain",
  },
  fileName: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  severity: {
    type: String,
    enum: ["critical", "high", "medium", "low", "info", null],
    default: null,
  },
  issuesCount: {
    type: Number,
    default: 0,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  chats: [codeReviewSchema],
  reviewsCount: {
    type: Number,
    default: 0,
  },
  dailyReviewCount: {
    type: Number,
    default: 0,
  },
  dailyReviewWindowStart: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<UserDocument>("User", userSchema);









