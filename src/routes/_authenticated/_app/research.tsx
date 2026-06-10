import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { ResponsibleAiNotice } from "@/components/responsible-ai-notice";
import { researchAssistant } from "@/lib/ai.functions";
import { bumpStat } from "@/lib/usage-stats";

export const Route = createFileRoute("/_authenticated/_app/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(researchAssistant);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (topic.trim().length < 2) {
      toast.error("Add a topic to research.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { topic, content } });
      setOutput(res?.text ?? "");
      bumpStat("research");
      toast.success("Briefing ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        icon={Search}
        title="Research Assistant"
        subtitle="Get a decision-ready briefing on any business topic."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. SMB CRM market trends"
              />
            </div>
            <div className="space-y-2">
              <Label>Source material (optional)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste notes, articles, or transcripts..."
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate briefing
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-3">
          <AiOutputCard
            title="Briefing"
            content={output}
            loading={loading}
            kind="research"
            saveTitle={topic || "Research brief"}
            onRegenerate={submit}
            onChange={setOutput}
            emptyHint="Enter a topic and click Generate briefing."
          />
          <ResponsibleAiNotice />
        </div>
      </div>
    </div>
  );
}
