import OpenAI from "openai";
let client = null;
export const configureOpenAI = () => {
    if (!client) {
        client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });
    }
    return client;
};
//# sourceMappingURL=openai-config.js.map