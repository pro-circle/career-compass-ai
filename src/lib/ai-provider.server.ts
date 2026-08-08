/**
 * Server-only multi-provider AI router.
 *
 * Providers, in order of preference:
 *   1. Groq (openai/gpt-oss-120b) across a pool of up to 3 API keys.
 *      Keys are round-robined; a key that fails (429 / 5xx / auth) is put in
 *      a short cooldown and the next key is used.
 *   2. Google Gemini (gemini-2.5-flash) as the fallback provider.
 *
 * Live data: `runAgent()` automatically routes to Gemini with Google Search
 * grounding whenever the request looks like it needs current information
 * (salaries, market data, company news, "latest"/"today" style questions),
 * or when `forceSearch` is passed.
 *
 * Never import this file from client code.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { serverEnv } from "./env.server";

export const GROQ_MODEL = "openai/gpt-oss-120b";
export const GEMINI_MODEL = "gemini-2.5-flash";

const COOLDOWN_MS = 60_000;
const cooldown = new Map<string, number>();
let cursor = 0;

/** All configured Groq keys, in declaration order. */
export function groqKeys(): string[] {
  const raw = [
    serverEnv("GROQ_API_KEY_1"),
    serverEnv("GROQ_API_KEY_2"),
    serverEnv("GROQ_API_KEY_3"),
    serverEnv("GROQ_API_KEY"),
  ];
  return Array.from(new Set(raw.filter((k): k is string => !!k && k.length > 8)));
}

function healthyGroqKeys(): string[] {
  const now = Date.now();
  const all = groqKeys();
  const healthy = all.filter((k) => (cooldown.get(k) ?? 0) < now);
  return healthy.length ? healthy : all;
}

export function markKeyFailed(key: string) {
  cooldown.set(key, Date.now() + COOLDOWN_MS);
}

function groqModel(key: string): LanguageModel {
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: key,
  })(GROQ_MODEL);
}

export function geminiKey(): string | undefined {
  return (
    serverEnv("GEMINI_API_KEY") || serverEnv("GOOGLE_GENERATIVE_AI_API_KEY")
  );
}

export function geminiModel(): LanguageModel | null {
  const key = geminiKey();
  if (!key) return null;
  return createGoogleGenerativeAI({ apiKey: key })(GEMINI_MODEL);
}

/** Google Search grounding tools, when a Gemini key is present. */
export function searchTools() {
  const key = geminiKey();
  if (!key) return undefined;
  const google = createGoogleGenerativeAI({ apiKey: key });
  return { google_search: google.tools.googleSearch({}) } as Record<string, unknown>;
}

export type Attempt = {
  provider: "groq" | "gemini";
  model: LanguageModel;
  key?: string;
};

/** Ordered list of provider attempts for a single request. */
export function providerChain(): Attempt[] {
  const chain: Attempt[] = [];
  const keys = healthyGroqKeys();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[(cursor + i) % keys.length];
    chain.push({ provider: "groq", model: groqModel(key), key });
  }
  cursor = keys.length ? (cursor + 1) % keys.length : 0;
  const gem = geminiModel();
  if (gem) chain.push({ provider: "gemini", model: gem });
  return chain;
}

export function hasAnyProvider(): boolean {
  return groqKeys().length > 0 || !!geminiKey();
}

/** The first model to try (used by streaming endpoints). */
export function primaryModel(): Attempt {
  const chain = providerChain();
  if (!chain.length) {
    throw new Error(
      "No AI provider configured. Set GROQ_API_KEY_1/2/3 or GEMINI_API_KEY in .env.",
    );
  }
  return chain[0];
}

const LIVE_HINTS = [
  "latest", "current", "today", "this week", "this year", "right now",
  "recent", "news", "trend", "market rate", "salary range", "hiring now",
  "who is hiring", "2025", "2026", "benchmark", "average salary", "glassdoor",
  "levels.fyi", "funding", "layoff", "stock", "open roles",
];

export function needsLiveData(text: string): boolean {
  const t = text.toLowerCase();
  return LIVE_HINTS.some((h) => t.includes(h));
}

/**
 * One-shot generation with automatic provider failover and optional
 * Google-Search grounding for live data.
 */
export async function runAgent(opts: {
  system?: string;
  prompt: string;
  forceSearch?: boolean;
  allowSearch?: boolean;
}): Promise<{ text: string; provider: string; grounded: boolean }> {
  const { generateText, stepCountIs } = await import("ai");
  const wantsSearch =
    opts.forceSearch ||
    (opts.allowSearch !== false && needsLiveData(`${opts.system ?? ""} ${opts.prompt}`));

  if (wantsSearch) {
    const gem = geminiModel();
    const tools = searchTools();
    if (gem && tools) {
      try {
        const { text } = await generateText({
          model: gem,
          system: opts.system,
          prompt: opts.prompt,
          tools,
          stopWhen: stepCountIs(5),
        } as never);
        if (text?.trim()) return { text, provider: "gemini+search", grounded: true };
      } catch {
        /* fall through to the normal chain */
      }
    }
  }

  const chain = providerChain();
  if (!chain.length) {
    throw new Error(
      "No AI provider configured. Set GROQ_API_KEY_1/2/3 or GEMINI_API_KEY in .env.",
    );
  }
  let lastErr: unknown;
  for (const attempt of chain) {
    try {
      const { text } = await generateText({
        model: attempt.model,
        system: opts.system,
        prompt: opts.prompt,
      });
      if (text?.trim()) return { text, provider: attempt.provider, grounded: false };
    } catch (err) {
      lastErr = err;
      if (attempt.key) markKeyFailed(attempt.key);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All AI providers failed");
}

/** Convenience: run the agent and parse the first JSON object it returns. */
export async function runAgentJson<T>(opts: {
  system?: string;
  prompt: string;
  forceSearch?: boolean;
}): Promise<T | null> {
  const { text } = await runAgent({ ...opts, allowSearch: opts.forceSearch });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
