import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const GROQ_MODEL = "openai/gpt-oss-120b";

export function getGroqProvider() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to .env.");
  }
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });
}

export function getGroqModel() {
  return getGroqProvider()(GROQ_MODEL);
}
