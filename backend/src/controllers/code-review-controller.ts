import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI, getAIModel } from "../config/openai-config.js";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import { waitUntil } from "@vercel/functions";

const CODE_REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge of multiple programming languages, design patterns, and best practices. Your role is to provide thorough, constructive code reviews.

When reviewing code:
1. Identify bugs and potential runtime errors
2. Check for security vulnerabilities
3. Assess code quality, readability, and maintainability
4. Suggest performance improvements
5. Recommend design pattern improvements
6. Check for best practices and conventions
7. Provide specific, actionable feedback

Format your reviews clearly with:
- Summary of findings
- Critical issues (if any)
- Recommendations for improvement
- Positive aspects of the code
- Code examples for fixes when applicable

Be constructive, specific, and respectful in your feedback.
Do not label a finding as critical unless the diff clearly introduces an exploitable security vulnerability, data loss, authentication bypass, severe availability issue, or a likely production outage. Generic suggestions about tests, consistency, or sensitive-data caution should be low or medium severity.`;

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

const detectLanguage = (code: string, fileName?: string): string => {
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      js: "javascript",
      ts: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      rb: "ruby",
      go: "go",
      rs: "rust",
      php: "php",
      swift: "swift",
      kt: "kotlin",
      sql: "sql",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      sh: "bash",
      bash: "bash",
    };
    if (ext && languageMap[ext]) {
      return languageMap[ext];
    }
  }

  // Heuristic detection
  if (code.includes("import React") || code.includes("from react"))
    return "jsx";
  if (code.includes("def ") && code.includes("python")) return "python";
  if (code.includes("public class")) return "java";
  if (code.includes("func ") && code.includes("Swift")) return "swift";
  if (code.includes("<?php")) return "php";

  return "plaintext";
};

const calculateSeverity = (review: string): "critical" | "high" | "medium" | "low" | "info" => {
  const criticalKeywords = [
    "authentication bypass",
    "authorization bypass",
    "data loss",
    "data leak",
    "remote code execution",
    "sql injection",
    "xss",
    "credential exposure",
    "production outage",
  ];
  const highKeywords = ["vulnerability", "crash", "runtime error", "regression"];
  const mediumKeywords = ["consider", "could", "improve", "better"];

  const lowerReview = review.toLowerCase();

  if (criticalKeywords.some((k) => lowerReview.includes(k))) {
    return "critical";
  } else if (highKeywords.some((k) => lowerReview.includes(k))) {
    return "high";
  } else if (mediumKeywords.some((k) => lowerReview.includes(k))) {
    return "medium";
  } else if (lowerReview.includes("good") || lowerReview.includes("well")) {
    return "low";
  }

  return "info";
};

const countIssues = (review: string): number => {
  const lines = review.split("\n");
  return lines.filter(
    (line) =>
      line.match(/^\d+\./) ||
      line.match(/^-/) ||
      line.match(/^\*/) ||
      line.toLowerCase().includes("issue") ||
      line.toLowerCase().includes("problem")
  ).length;
};

const MAX_PR_DIFF_CHARS = Number(process.env.MAX_PR_DIFF_CHARS || 50000);
const GITHUB_API_VERSION = "2022-11-28";

interface GitHubPrReference {
  owner: string;
  repo: string;
  pullNumber: number;
}

const parseGithubPrUrl = (prUrl: string): GitHubPrReference => {
  const url = new URL(prUrl);
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);

  if (!match) {
    throw new Error("Invalid GitHub pull request URL");
  }

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: Number(match[3]),
  };
};

const getGithubHeaders = (token?: string, accept = "application/vnd.github+json") => {
  const headers: Record<string, string> = {
    Accept: accept,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "User-Agent": "ai-code-reviewer",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const githubRequest = async <T>(
  url: string,
  token?: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getGithubHeaders(token),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GitHub API request failed (${response.status}): ${
        errorBody || response.statusText
      }`
    );
  }

  return response.json() as Promise<T>;
};

const fetchGithubPrDiff = async (
  reference: GitHubPrReference,
  token?: string
) => {
  const prApiUrl = `https://api.github.com/repos/${reference.owner}/${reference.repo}/pulls/${reference.pullNumber}`;
  const pr = await githubRequest<{
    title: string;
    html_url: string;
    user?: { login?: string };
    base?: { ref?: string };
    head?: { ref?: string; sha?: string };
    changed_files?: number;
    additions?: number;
    deletions?: number;
  }>(prApiUrl, token);

  const diffResponse = await fetch(prApiUrl, {
    headers: getGithubHeaders(token, "application/vnd.github.diff"),
  });

  if (!diffResponse.ok) {
    throw new Error(
      `GitHub PR diff request failed (${diffResponse.status}): ${
        (await diffResponse.text()) || diffResponse.statusText
      }`
    );
  }

  const rawDiff = await diffResponse.text();
  const truncated = rawDiff.length > MAX_PR_DIFF_CHARS;
  const diff = truncated
    ? `${rawDiff.slice(
        0,
        MAX_PR_DIFF_CHARS
      )}\n\n[Diff truncated at ${MAX_PR_DIFF_CHARS} characters. Review may be incomplete.]`
    : rawDiff;

  return { pr, diff, truncated };
};

const postGithubPrComment = async (
  reference: GitHubPrReference,
  token: string,
  body: string
) => {
  return githubRequest<{ html_url?: string }>(
    `https://api.github.com/repos/${reference.owner}/${reference.repo}/issues/${reference.pullNumber}/comments`,
    token,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }
  );
};

const getGithubPrComments = async (
  reference: GitHubPrReference,
  token: string
) => {
  return githubRequest<Array<{ body?: string }>>(
    `https://api.github.com/repos/${reference.owner}/${reference.repo}/issues/${reference.pullNumber}/comments?per_page=100`,
    token
  );
};

const buildWebhookCommentMarker = (
  reference: GitHubPrReference,
  headSha?: string
) => {
  return `<!-- ai-code-review:${reference.owner}/${reference.repo}#${reference.pullNumber}:${headSha || "unknown"} -->`;
};

const hasExistingWebhookReview = async (
  reference: GitHubPrReference,
  token: string,
  headSha?: string
) => {
  const marker = buildWebhookCommentMarker(reference, headSha);
  const comments = await getGithubPrComments(reference, token);
  return comments.some((comment) => comment.body?.includes(marker));
};

const buildGithubPrReviewPrompt = ({
  reference,
  pr,
  diff,
  message,
}: {
  reference: GitHubPrReference;
  pr: {
    title: string;
    html_url: string;
    user?: { login?: string };
    base?: { ref?: string };
    head?: { ref?: string; sha?: string };
    changed_files?: number;
    additions?: number;
    deletions?: number;
  };
  diff: string;
  message?: string;
}) => {
  return `
GitHub Pull Request Review Request:
Repository: ${reference.owner}/${reference.repo}
PR: #${reference.pullNumber} - ${pr.title}
URL: ${pr.html_url}
Author: ${pr.user?.login || "unknown"}
Base: ${pr.base?.ref || "unknown"}
Head: ${pr.head?.ref || "unknown"} (${pr.head?.sha || "unknown"})
Changed files: ${pr.changed_files ?? "unknown"}
Additions: ${pr.additions ?? "unknown"}
Deletions: ${pr.deletions ?? "unknown"}

${message ? `Review focus: ${message}\n` : ""}
Review this unified diff. Prioritize concrete bugs, security risks, regressions, and missing tests. Reference filenames from the diff when possible. Do not invent line numbers if they are not clear from the diff.

\`\`\`diff
${diff}
\`\`\`
    `.trim();
};

const generateGithubPrReview = async (
  reference: GitHubPrReference,
  token?: string,
  message?: string,
  history: ChatCompletionMessageParam[] = []
) => {
  const { pr, diff, truncated } = await fetchGithubPrDiff(reference, token);

  if (!diff.trim()) {
    throw new Error("GitHub returned an empty diff for this pull request.");
  }

  const userMessage = buildGithubPrReviewPrompt({
    reference,
    pr,
    diff,
    message,
  });

  const openai = configureOpenAI();
  const chatResponse = await openai.chat.completions.create({
    model: getAIModel(),
    messages: [
      { role: "system", content: CODE_REVIEW_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage },
    ],
    max_completion_tokens: 3500,
  });

  const reviewContent =
    chatResponse.choices[0]?.message?.content ||
    "No review content was returned.";

  return {
    pr,
    diff,
    truncated,
    userMessage,
    reviewContent,
    severity: calculateSeverity(reviewContent),
    issuesCount: countIssues(reviewContent),
  };
};

const verifyGithubWebhookSignature = (
  rawBody: Buffer | undefined,
  signature: string | undefined,
  secret: string | undefined
) => {
  const webhookSecret = secret?.trim();

  if (!webhookSecret) {
    return true;
  }

  if (!rawBody || !signature?.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")}`;
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  );
};

const getGithubWebhookDiagnostics = (
  req: Request,
  rawBody: Buffer | undefined,
  signature: string | undefined
) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();

  return {
    contentType: req.header("content-type") || null,
    event: req.header("x-github-event") || null,
    delivery: req.header("x-github-delivery") || null,
    hasRawBody: Boolean(rawBody),
    rawBodyBytes: rawBody?.length || 0,
    hasSignature256: Boolean(signature),
    signatureStartsWithSha256: Boolean(signature?.startsWith("sha256=")),
    webhookSecretConfigured: Boolean(secret),
    webhookSecretLength: secret?.length || 0,
    nodeEnv: process.env.NODE_ENV || null,
    vercel: process.env.VERCEL || null,
  };
};

const parseGithubWebhookPayload = (body: any) => {
  if (typeof body?.payload === "string") {
    return JSON.parse(body.payload);
  }

  return body;
};

const reviewPullRequestFromWebhook = async ({
  owner,
  repo,
  pullNumber,
  deliveryId,
  headSha,
}: {
  owner: string;
  repo: string;
  pullNumber: number;
  deliveryId: string;
  headSha?: string;
}) => {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is required for webhook PR comments.");
  }

  const reference = { owner, repo, pullNumber };
  if (await hasExistingWebhookReview(reference, githubToken, headSha)) {
    console.log(
      `Skipping duplicate webhook review for ${owner}/${repo}#${pullNumber} at ${headSha || "unknown"}`
    );
    return "skipped";
  }

  const { reviewContent, truncated } = await generateGithubPrReview(
    reference,
    githubToken,
    "This review was triggered automatically by a GitHub pull_request webhook."
  );

  await postGithubPrComment(
    reference,
    githubToken,
    [
      buildWebhookCommentMarker(reference, headSha),
      "## AI Code Review",
      "",
      `Triggered automatically by GitHub webhook delivery \`${deliveryId}\`.`,
      truncated
        ? `Note: the PR diff was truncated at ${MAX_PR_DIFF_CHARS} characters, so this review may be incomplete.`
        : null,
      reviewContent,
    ]
      .filter(Boolean)
      .join("\n\n")
  );

  return "posted";
};

const shouldProcessWebhookSynchronously = () => {
  return process.env.GITHUB_WEBHOOK_PROCESS_MODE === "sync";
};

export const reviewCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code, message, fileName, language: requestedLanguage } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({
        message: "User not registered or token is invalid",
        success: false,
      });
    }

    syncDailyReviewWindow(user);
    if ((user.dailyReviewCount || 0) >= DAILY_REVIEW_LIMIT) {
      return res.status(429).json({
        message: `Daily review limit reached. You can submit ${DAILY_REVIEW_LIMIT} reviews per day.`,
        success: false,
        limit: DAILY_REVIEW_LIMIT,
        remaining: 0,
      });
    }

    // Detect language
    const language =
      requestedLanguage && requestedLanguage !== "auto"
        ? requestedLanguage
        : detectLanguage(code, fileName);

    // Build conversation history
    const chats: ChatCompletionMessageParam[] = user.chats.map(
      ({ role, content }) => ({
        role: role as "system" | "user" | "assistant",
        content,
      })
    );

    // Add user message
    const userMessage = `
Code Review Request:
${fileName ? `File: ${fileName}\n` : ""}Language: ${language}

\`\`\`${language}
${code}
\`\`\`

${message ? `Additional context: ${message}` : ""}
    `.trim();

    chats.push({ role: "user", content: userMessage });
    user.chats.push({
      id: randomUUID(),
      role: "user",
      content: userMessage,
      code,
      language,
      fileName: fileName || null,
      timestamp: new Date(),
      severity: null,
      issuesCount: 0,
    });

    // Call OpenAI with system prompt for code review
    const openai = configureOpenAI();

    const chatResponse = await openai.chat.completions.create({
      model: getAIModel(),
      messages: [
        { role: "system", content: CODE_REVIEW_SYSTEM_PROMPT },
        ...chats,
      ],
      max_completion_tokens: 3000,
    });

    const reply = chatResponse.choices[0]?.message;
    if (reply) {
      const reviewContent = reply.content ?? "No review content was returned.";
      const severity = calculateSeverity(reviewContent);
      const issuesCount = countIssues(reviewContent);

      user.chats.push({
        id: randomUUID(),
        role: "assistant",
        content: reviewContent,
        code: null,
        language: null,
        fileName: null,
        timestamp: new Date(),
        severity,
        issuesCount,
      });

      user.reviewsCount = (user.reviewsCount || 0) + 1;
      user.dailyReviewCount = (user.dailyReviewCount || 0) + 1;
    }

    await user.save();

    return res.status(200).json({
      message: "Code review completed successfully",
      success: true,
      chats: user.chats,
      reviewsCount: user.reviewsCount,
      limit: DAILY_REVIEW_LIMIT,
      remaining: Math.max(DAILY_REVIEW_LIMIT - (user.dailyReviewCount || 0), 0),
    });
  } catch (error: any) {
    console.error("Code review error:", error);
    const statusCode = error.status || error.statusCode || 500;
    const isValidationError = error.name === "ValidationError";
    const isConfigurationError =
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("openai is not configured");

    return res.status(isValidationError ? 400 : isConfigurationError ? 500 : 502).json({
      message: isConfigurationError
        ? error.message
        : isValidationError
        ? "The review could not be saved. Please try again."
        : error.message || "Error processing code review",
      success: false,
      error: error.message,
      statusCode,
    });
  }
};

export const reviewGithubPullRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    prUrl,
    message,
    postToGithub = false,
    githubToken: requestGithubToken,
  } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({
        message: "User not registered or token is invalid",
        success: false,
      });
    }

    syncDailyReviewWindow(user);
    if ((user.dailyReviewCount || 0) >= DAILY_REVIEW_LIMIT) {
      return res.status(429).json({
        message: `Daily review limit reached. You can submit ${DAILY_REVIEW_LIMIT} reviews per day.`,
        success: false,
        limit: DAILY_REVIEW_LIMIT,
        remaining: 0,
      });
    }

    const githubToken = requestGithubToken || process.env.GITHUB_TOKEN;
    if (postToGithub && !githubToken) {
      return res.status(400).json({
        message:
          "A GitHub token is required to post the review back to the pull request.",
        success: false,
      });
    }

    const reference = parseGithubPrUrl(prUrl);
    const chats: ChatCompletionMessageParam[] = user.chats.map(
      ({ role, content }) => ({
        role: role as "system" | "user" | "assistant",
        content,
      })
    );

    const {
      diff,
      truncated,
      userMessage,
      reviewContent,
      severity,
      issuesCount,
    } = await generateGithubPrReview(
      reference,
      githubToken,
      message,
      chats
    );

    user.chats.push({
      id: randomUUID(),
      role: "user",
      content: userMessage,
      code: diff,
      language: "diff",
      fileName: `${reference.owner}/${reference.repo}#${reference.pullNumber}`,
      timestamp: new Date(),
      severity: null,
      issuesCount: 0,
    });

    let githubCommentUrl: string | undefined;
    if (postToGithub && githubToken) {
      const comment = await postGithubPrComment(
        reference,
        githubToken,
        [
          "## AI Code Review",
          "",
          truncated
            ? `Note: the PR diff was truncated at ${MAX_PR_DIFF_CHARS} characters, so this review may be incomplete.`
            : null,
          reviewContent,
        ]
          .filter(Boolean)
          .join("\n")
      );
      githubCommentUrl = comment.html_url;
    }

    user.chats.push({
      id: randomUUID(),
      role: "assistant",
      content: githubCommentUrl
        ? `${reviewContent}\n\nPosted to GitHub: ${githubCommentUrl}`
        : reviewContent,
      code: null,
      language: null,
      fileName: null,
      timestamp: new Date(),
      severity,
      issuesCount,
    });

    user.reviewsCount = (user.reviewsCount || 0) + 1;
    user.dailyReviewCount = (user.dailyReviewCount || 0) + 1;
    await user.save();

    return res.status(200).json({
      message: githubCommentUrl
        ? "Pull request reviewed and posted to GitHub"
        : "Pull request reviewed successfully",
      success: true,
      chats: user.chats,
      reviewsCount: user.reviewsCount,
      limit: DAILY_REVIEW_LIMIT,
      remaining: Math.max(DAILY_REVIEW_LIMIT - (user.dailyReviewCount || 0), 0),
      githubCommentUrl,
      truncated,
    });
  } catch (error: any) {
    console.error("GitHub PR review error:", error);
    const isConfigurationError =
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("openai is not configured");

    return res.status(isConfigurationError ? 500 : 502).json({
      message: isConfigurationError
        ? error.message
        : error.message || "Error processing GitHub pull request review",
      success: false,
      error: error.message,
    });
  }
};

export const handleGithubWebhook = async (req: Request, res: Response) => {
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  const signature = req.header("x-hub-signature-256");
  const eventName = req.header("x-github-event");
  const deliveryId = req.header("x-github-delivery") || "unknown";

  if (
    !verifyGithubWebhookSignature(
      rawBody,
      signature,
      process.env.GITHUB_WEBHOOK_SECRET
    )
  ) {
    const diagnostics = getGithubWebhookDiagnostics(req, rawBody, signature);
    console.error("Invalid GitHub webhook signature", diagnostics);

    return res.status(401).json({
      success: false,
      message: "Invalid GitHub webhook signature",
      diagnostics,
    });
  }

  if (eventName === "ping") {
    return res.status(200).json({
      success: true,
      message: "GitHub webhook configured successfully",
    });
  }

  if (eventName !== "pull_request") {
    return res.status(202).json({
      success: true,
      message: `Ignored GitHub event: ${eventName || "unknown"}`,
    });
  }

  const payload = parseGithubWebhookPayload(req.body) as {
    action?: string;
    pull_request?: { number?: number; html_url?: string; head?: { sha?: string } };
    repository?: {
      name?: string;
      full_name?: string;
      owner?: { login?: string };
    };
  };
  const allowedActions = new Set(["opened", "synchronize", "reopened"]);

  if (!payload.action || !allowedActions.has(payload.action)) {
    return res.status(202).json({
      success: true,
      message: `Ignored pull_request action: ${payload.action || "unknown"}`,
    });
  }

  const owner = payload.repository?.owner?.login;
  const repo = payload.repository?.name;
  const pullNumber = payload.pull_request?.number;
  const headSha = payload.pull_request?.head?.sha;

  if (!owner || !repo || !pullNumber) {
    return res.status(422).json({
      success: false,
      message: "Webhook payload is missing repository or pull request data",
    });
  }

  const reviewJob = {
    owner,
    repo,
    pullNumber,
    deliveryId,
    headSha,
  };

  if (shouldProcessWebhookSynchronously()) {
    try {
      const result = await reviewPullRequestFromWebhook(reviewJob);
      return res.status(200).json({
        success: true,
        message:
          result === "skipped"
            ? "Pull request review already exists for this commit"
            : "Pull request reviewed and commented",
        repository: payload.repository?.full_name || `${owner}/${repo}`,
        pullNumber,
        action: payload.action,
        result,
      });
    } catch (error: any) {
      console.error(
        `GitHub webhook review failed for ${owner}/${repo}#${pullNumber}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message || "GitHub webhook review failed",
      });
    }
  }

  const backgroundReview = reviewPullRequestFromWebhook(reviewJob).catch((error) => {
    console.error(
      `GitHub webhook review failed for ${owner}/${repo}#${pullNumber}:`,
      error
    );
  });

  if (process.env.VERCEL === "1") {
    waitUntil(backgroundReview);
  }

  res.status(202).json({
    success: true,
    message: "Pull request review queued",
    repository: payload.repository?.full_name || `${owner}/${repo}`,
    pullNumber,
    action: payload.action,
  });
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
      message: "Chats retrieved successfully",
      success: true,
      chats: user.chats,
      reviewsCount: user.reviewsCount,
    });
  } catch (error: any) {
    console.error("Get chats error:", error);
    return res.status(500).json({
      message: "Error retrieving chats",
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
      message: "Chats deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Delete chats error:", error);
    return res.status(500).json({
      message: "Error deleting chats",
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
