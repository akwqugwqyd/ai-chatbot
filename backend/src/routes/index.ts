import { Router } from "express";
import userRoutes from "./user-routes.js";
import chatRoutes from "./chat-routes.js";
import githubRoutes from "./github-routes.js";

const appRouter = Router();

appRouter.use("/user", userRoutes); 
appRouter.use("/chat", chatRoutes); 
appRouter.use("/github", githubRoutes);

export default appRouter;
