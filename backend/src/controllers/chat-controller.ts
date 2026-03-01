import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    // grab chats of user
    const chats: ChatCompletionMessageParam[] = user.chats.map(({ role, content }) => ({
  role: role as "system" | "user" | "assistant",
  content,
}));

chats.push({ role: "user", content: message });
user.chats.push({ role: "user", content: message });

    // v4 OpenAI client
    const openai = configureOpenAI();

    // get latest response
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chats,
    });

    const reply = chatResponse.choices[0]?.message;
    if (reply) {
      user.chats.push(reply);
    }

    await user.save();
    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
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
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
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
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    user.chats.splice(0); // instead of user.chats = []

    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.error(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};


