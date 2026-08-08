import { createFileRoute } from "@tanstack/react-router";
import { streamText, stepCountIs } from "ai";

/**
 * Streams AI text for one-shot generators (resume optimizer, cover letter,
 * mock-interview coach). Body: { prompt, system?, context?, search? }.
 *
 * Provider selection is handled by src/lib/ai-provider.server.ts:
 * Gemini (primary) -> Groq key pool (failover), with Google Search grounding
 * whenever the request needs live data.
 */
export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          prompt?: string;
          system?: string;
          context?: string;
          search?: boolean;
        };
        if (!body.prompt) {
          return new Response("prompt required", { status: 400 });
        }
        const {
          hasAnyProvider,
          primaryModel,
          markKeyFailed,
          needsLiveData,
          geminiModel,
          searchTools,
        } = await import("@/lib/ai-provider.server");

        if (!hasAnyProvider()) {
          return new Response(
            "No AI provider configured. Set GEMINI_API_KEY (primary) or GROQ_API_KEY_1/2/3.",
            { status: 500 },
          );
        }

        const prompt = body.context
          ? `${body.context}\n\n---\n\n${body.prompt}`
          : body.prompt;
        const wantsLive = body.search || needsLiveData(prompt);
        const grounded = wantsLive ? geminiModel() : null;
        const tools = grounded ? searchTools() : undefined;
        const attempt = grounded ? null : primaryModel();

        const result = streamText({
          model: grounded ?? attempt!.model,
          system: body.system ?? "You are a helpful assistant. Use markdown.",
          prompt,
          ...(grounded && tools ? { tools, stopWhen: stepCountIs(5) } : {}),
          onError: ({ error }: { error: unknown }) => {
            if (attempt?.key) markKeyFailed(attempt.key);
            console.error("[generate] stream error", error);
          },
        } as never);

        return result.toTextStreamResponse();
      },
    },
  },
});
