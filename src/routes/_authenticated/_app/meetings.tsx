import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { ResponsibleAiNotice } from "@/components/responsible-ai-notice";
import { summarizeMeeting } from "@/lib/ai.functions";
import { bumpStat } from "@/lib/usage-stats";

export const Route = createFileRoute("/_authenticated/_app/meetings")({
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (notes.trim().length < 20) {
      toast.error("Paste at least a short paragraph of meeting notes.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { title, notes } });
      setOutput(res?.text ?? "");
      bumpStat("meeting");
      toast.success("Summary ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        icon={CalendarCheck}
        title="Meeting Notes Summarizer"
        subtitle="Turn raw notes into decisions, actions, owners, and deadlines."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meeting title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 roadmap review"
              />
            </div>
            <div className="space-y-2">
              <Label>Raw notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your meeting notes, transcript, or bullet points..."
                className="min-h-[260px]"
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Summarize meeting
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-3">
          <AiOutputCard
            title="Meeting summary"
            content={output}
            loading={loading}
            kind="meeting"
            saveTitle={title || "Meeting summary"}
            onRegenerate={submit}
            onChange={setOutput}
            emptyHint="Paste meeting notes and click Summarize."
          />
          <ResponsibleAiNotice />
        </div>
      </div>
    </div>
  );
}
