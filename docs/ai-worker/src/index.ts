/**
 * ATS Engine AI Worker
 * ------------------------------------------------------------
 * A tiny Cloudflare Worker that proxies the browser SPA to the Groq
 * Chat Completions API. GROQ_API_KEY lives ONLY here (as a wrangler
 * secret), never in the SPA bundle.
 *
 * Endpoints:
 *   POST /chat     { messages, system? }          -> streamed text/plain
 *   POST /generate { prompt, system?, context? }  -> streamed text/plain
 *   POST /joblink  { url }                        -> JSON job details
 *
 * Deploy:
 *   npm i -g wrangler
 *   wrangler login
 *   wrangler secret put GROQ_API_KEY
 *   wrangler secret put ALLOWED_ORIGINS   # comma-separated
 *   wrangler deploy
 */
export interface Env {
  GROQ_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

const MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowlist = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allow =
    !origin || allowlist.length === 0
      ? "*"
      : allowlist.includes(origin)
        ? origin
        : allowlist[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

async function streamGroq(
  messages: unknown,
  env: Env,
  origin: string | null,
): Promise<Response> {
  const upstream = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, stream: true, messages }),
  });
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(text || "Upstream error", {
      status: upstream.status || 502,
      headers: corsHeaders(origin, env),
    });
  }
  // Convert SSE stream to plain text tokens for easy fetch/EventSource use in the SPA.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) return controller.close();
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const token = json.choices?.[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        } catch {
          /* ignore parse errors */
        }
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin, env),
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders(origin, env),
      });
    }
    if (!env.GROQ_API_KEY) {
      return new Response("Missing GROQ_API_KEY", {
        status: 500,
        headers: corsHeaders(origin, env),
      });
    }

    try {
      const body = (await request.json()) as Record<string, unknown>;

      if (url.pathname === "/chat") {
        const system =
          (body.system as string | undefined) ??
          "You are ATS Engine, an intelligent career and hiring assistant. Be concise, warm, and specific. Use markdown.";
        return streamGroq(
          [{ role: "system", content: system }, ...(body.messages as unknown[])],
          env,
          origin,
        );
      }

      if (url.pathname === "/generate") {
        const system =
          (body.system as string | undefined) ??
          "You are a helpful assistant. Use markdown.";
        const prompt = body.context
          ? `${body.context}\n\n---\n\n${body.prompt}`
          : (body.prompt as string);
        return streamGroq(
          [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          env,
          origin,
        );
      }

      if (url.pathname === "/joblink") {
        const target = body.url as string;
        const html = await fetch(target, {
          headers: { "User-Agent": "ATSEngineBot/1.0" },
        }).then((r) => r.text());
        const clean = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 12000);

        const upstream = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: MODEL,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "Extract job details as strict JSON: {title, company, location, employment_type, salary, requirements[], preferences[], responsibilities[], summary}. Return ONLY JSON.",
              },
              { role: "user", content: clean },
            ],
          }),
        });
        const json = (await upstream.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = json.choices?.[0]?.message?.content ?? "{}";
        return new Response(content, {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin, env),
          },
        });
      }

      return new Response("Not found", {
        status: 404,
        headers: corsHeaders(origin, env),
      });
    } catch (err) {
      return new Response(
        `Error: ${err instanceof Error ? err.message : "unknown"}`,
        { status: 500, headers: corsHeaders(origin, env) },
      );
    }
  },
};
