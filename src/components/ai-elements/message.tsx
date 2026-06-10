import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";

export function Message({
  role,
  children,
}: {
  role: "user" | "assistant" | "system";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      {children}
    </div>
  );
}

export function MessageContent({
  role,
  text,
}: {
  role: "user" | "assistant" | "system";
  text: string;
}) {
  if (role === "user") {
    return (
      <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-soft whitespace-pre-wrap">
        {text}
      </div>
    );
  }
  return (
    <div className="max-w-full text-sm">
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:tracking-tight">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

export function MessageFromUI({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  return (
    <Message role={message.role as "user" | "assistant"}>
      <MessageContent role={message.role as "user" | "assistant"} text={text} />
    </Message>
  );
}
