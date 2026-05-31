import OpenAI from "openai";

let client: OpenAI | null = null;

export const getAIModel = () => {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
};

export const configureOpenAI = () => {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OpenAI is not configured. Set OPENAI_API_KEY in backend/.env."
      );
    }

    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
};
