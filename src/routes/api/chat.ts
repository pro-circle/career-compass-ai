import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: unknown;
          system?: string;
        };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
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

        const messages = body.messages as UIMessage[];
        const lastText = JSON.stringify(messages.at(-1) ?? "");
        const wantsLive = needsLiveData(lastText);
        const grounded = wantsLive ? geminiModel() : null;
        const tools = grounded ? searchTools() : undefined;
        const attempt = grounded ? null : primaryModel();

        const result = streamText({
          model: grounded ?? attempt!.model,
          system:
            body.system ??
            "You are ATS Engine, an intelligent career and hiring assistant. Be concise, warm, and specific. Use markdown. When you use web results, cite the source names inline.",
          messages: await convertToModelMessages(messages),
          ...(grounded && tools ? { tools, stopWhen: stepCountIs(5) } : {}),
          onError: ({ error }: { error: unknown }) => {
            if (attempt?.key) markKeyFailed(attempt.key);
            console.error("[chat] stream error", error);
          },
        } as never);

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
        });
      },
    },
  },
});
