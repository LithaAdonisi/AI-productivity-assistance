import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import {
  createLovableAiGatewayProvider,
  DEFAULT_MODEL,
  getGatewayKey,
} from "./ai-gateway.server";

function model() {
  return createLovableAiGatewayProvider(getGatewayKey())(DEFAULT_MODEL);
}

function mapAiError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("429")) throw new Error("Rate limit reached. Please try again shortly.");
  if (msg.includes("402"))
    throw new Error("AI credits exhausted. Please add credits to continue.");
  throw new Error(msg || "AI request failed.");
}

const EmailInput = z.object({
  purpose: z.string().min(3).max(2000),
  recipient: z.enum(["Client", "Manager", "Team Member", "Partner", "Other"]),
  tone: z.enum(["Professional", "Formal", "Friendly", "Persuasive"]),
  keyPoints: z.string().max(2000).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: model(),
        system:
          "You are an expert business communication assistant. Write clear, professional emails that respect the recipient's time. Use en dashes (–) instead of em dashes. Output ONLY the email, starting with the Subject line.",
        prompt: `Write an email.\n\nPurpose: ${data.purpose}\nRecipient: ${data.recipient}\nTone: ${data.tone}\nKey points: ${data.keyPoints || "(none)"}\n\nFormat: start with "Subject: ...", then a greeting, 2-4 short paragraphs, and a sign-off ending with [Your Name].`,
      });
      return { text };
    } catch (e) {
      mapAiError(e);
    }
  });

const MeetingInput = z.object({
  title: z.string().max(200).optional(),
  notes: z.string().min(20).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: model(),
        system:
          "You are an executive meeting analyst. Extract decisions, actions, owners, and deadlines from raw meeting notes. Use en dashes (–). Be concise and business-friendly.",
        prompt: `Summarize the following meeting notes${data.title ? ` for "${data.title}"` : ""}.\n\nNotes:\n${data.notes}\n\nReturn Markdown with these sections in order:\n## Executive Summary\n## Key Discussion Points\n## Decisions Made\n## Action Items\n(Render Action Items as a Markdown table with columns: Action | Owner | Deadline. Use "TBD" when unknown.)\n## Risks & Follow-ups`,
      });
      return { text };
    } catch (e) {
      mapAiError(e);
    }
  });

const TasksInput = z.object({
  tasks: z.string().min(5).max(5000),
  hours: z.number().min(1).max(24),
  priority: z.enum(["Low", "Medium", "High", "Mixed"]),
  deadlines: z.string().max(2000).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TasksInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: model(),
        system:
          "You are a senior productivity coach. Build realistic, time-blocked schedules using the Eisenhower matrix (urgent x important). Minimize context switching. Use en dashes (–).",
        prompt: `Plan my work.\n\nTasks:\n${data.tasks}\n\nAvailable hours: ${data.hours}\nPriority level: ${data.priority}\nDeadlines: ${data.deadlines || "(none)"}\n\nReturn Markdown with:\n## Prioritized Tasks\n(numbered list with a one-line rationale)\n## Time-Blocked Schedule\n(Markdown table: Time | Task | Focus Mode)\n## Productivity Tips\n(3-5 bullets)`,
      });
      return { text };
    } catch (e) {
      mapAiError(e);
    }
  });

const ResearchInput = z.object({
  topic: z.string().min(2).max(500),
  content: z.string().max(20000).optional(),
});

export const researchAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: model(),
        system:
          "You are a senior business analyst. Produce concise, decision-ready briefings. Use en dashes (–). Flag uncertainty explicitly.",
        prompt: `Research topic: ${data.topic}\n\nSource material (optional):\n${data.content || "(none)"}\n\nReturn Markdown with:\n## Summary\n## Key Insights\n(5-7 bullets)\n## Recommendations\n(numbered)\n## Risks & Opportunities\n## Quick Takeaways\n(3 bold one-liners)`,
      });
      return { text };
    } catch (e) {
      mapAiError(e);
    }
  });
