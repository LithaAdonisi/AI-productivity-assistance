import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { ResponsibleAiNotice } from "@/components/responsible-ai-notice";
import { generateEmail } from "@/lib/ai.functions";
import { bumpStat } from "@/lib/usage-stats";

export const Route = createFileRoute("/_authenticated/_app/email")({
  component: EmailPage,
});

type Recipient = "Client" | "Manager" | "Team Member" | "Partner" | "Other";
type Tone = "Professional" | "Formal" | "Friendly" | "Persuasive";

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState<Recipient>("Client");
  const [tone, setTone] = useState<Tone>("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (purpose.trim().length < 3) {
      toast.error("Describe the purpose of the email.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { purpose, recipient, tone, keyPoints } });
      setOutput(res?.text ?? "");
      bumpStat("email");
      toast.success("Email drafted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        subtitle="Turn a quick brief into a polished, ready-to-send email."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Follow up with client about the Q4 proposal"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select value={recipient} onValueChange={(v) => setRecipient(v as Recipient)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Client", "Manager", "Team Member", "Partner", "Other"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Professional", "Formal", "Friendly", "Persuasive"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Key points (optional)</Label>
              <Input
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="e.g. confirm meeting, share doc, ask for feedback"
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate email
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-3">
          <AiOutputCard
            title="Drafted email"
            content={output}
            loading={loading}
            kind="email"
            saveTitle={purpose.slice(0, 60) || "Email draft"}
            onRegenerate={submit}
            onChange={setOutput}
            emptyHint="Fill in the brief and click Generate email."
          />
          <ResponsibleAiNotice />
        </div>
      </div>
    </div>
  );
}
