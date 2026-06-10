import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  DEFAULT_MODEL,
  getGatewayKey,
} from "@/lib/ai-gateway.server";

const SYSTEM = `You are an AI Workplace Productivity Assistant — a calm, expert co-worker for business professionals.
You help with: drafting and improving professional communication; planning days and weeks, prioritizing tasks; summarizing meetings, documents, and reports; generating decision-ready insights and recommendations; answering general workplace and productivity questions.
Style: Concise, action-oriented, scannable. Use markdown lists, headings, and tables when useful. Use en dashes (–) instead of em dashes. Ask one clarifying question only if the request is genuinely ambiguous. Be transparent about uncertainty. Recommend that the user review important outputs before use.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as { messages?: UIMessage[] };
          if (!Array.isArray(messages)) {
            return new Response("Messages required", { status: 400 });
          }
          const gateway = createLovableAiGatewayProvider(getGatewayKey());
          const result = streamText({
            model: gateway(DEFAULT_MODEL),
            system: SYSTEM,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("429")) return new Response("Rate limit reached.", { status: 429 });
          if (msg.includes("402"))
            return new Response("AI credits exhausted.", { status: 402 });
          console.error(e);
          return new Response("AI request failed.", { status: 500 });
        }
      },
    },
  },
});
