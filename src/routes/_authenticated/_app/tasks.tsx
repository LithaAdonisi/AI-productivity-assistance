import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
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
import { planTasks } from "@/lib/ai.functions";
import { bumpStat } from "@/lib/usage-stats";

export const Route = createFileRoute("/_authenticated/_app/tasks")({
  component: TasksPage,
});

type Priority = "Low" | "Medium" | "High" | "Mixed";

function TasksPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState(8);
  const [priority, setPriority] = useState<Priority>("Mixed");
  const [deadlines, setDeadlines] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (tasks.trim().length < 5) {
      toast.error("List a few tasks to plan.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { tasks, hours, priority, deadlines } });
      setOutput(res?.text ?? "");
      bumpStat("task");
      toast.success("Plan ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        icon={ClipboardList}
        title="Task Planner"
        subtitle="Get a time-blocked, priority-aware schedule for the day."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tasks</Label>
              <Textarea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder="One task per line..."
                className="min-h-[200px]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Available hours</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, Math.min(24, Number(e.target.value))))}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Mixed"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deadlines (optional)</Label>
              <Input
                value={deadlines}
                onChange={(e) => setDeadlines(e.target.value)}
                placeholder="e.g. proposal due 4pm"
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Build my plan
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-3">
          <AiOutputCard
            title="Today's plan"
            content={output}
            loading={loading}
            kind="task"
            saveTitle="Task plan"
            onRegenerate={submit}
            onChange={setOutput}
            emptyHint="Add tasks and hours, then click Build my plan."
          />
          <ResponsibleAiNotice />
        </div>
      </div>
    </div>
  );
}
