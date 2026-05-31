import { Router } from "express";
import { handleGithubWebhook } from "../controllers/code-review-controller.js";

const githubRoutes = Router();

githubRoutes.post("/webhook", handleGithubWebhook);

export default githubRoutes;
