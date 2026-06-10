import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  Mail,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory, useUsageStats } from "@/hooks/use-usage-stats";

export const Route = createFileRoute("/_authenticated/_app/dashboard")({
  component: Dashboard,
});

const STAT_CARDS = [
  { key: "email" as const, label: "Emails Generated", icon: Mail, to: "/email" },
  { key: "meeting" as const, label: "Meetings Summarized", icon: CalendarCheck, to: "/meetings" },
  { key: "task" as const, label: "Task Plans", icon: ClipboardList, to: "/tasks" },
  { key: "research" as const, label: "Research Requests", icon: Sparkles, to: "/research" },
];

const KIND_LABELS: Record<string, string> = {
  email: "Email",
  meeting: "Meeting",
  task: "Task plan",
  research: "Research",
};

function Dashboard() {
  const stats = useUsageStats();
  const history = useHistory();
  const total = STAT_CARDS.reduce((a, c) => a + (stats[c.key] || 0), 0) + (stats.chat || 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Card className="overflow-hidden rounded-3xl border-0 shadow-elegant">
        <div className="relative bg-gradient-hero p-8 sm:p-10">
          <p className="text-sm font-medium text-muted-foreground">Welcome</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Your <span className="text-gradient">AI workplace</span> assistant
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Pick a tool to move work forward – Workplace AI handles drafting, summarizing,
            planning, and research so you stay in flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="shadow-soft">
              <Link to="/email">
                <Mail className="h-4 w-4" /> Draft an email
              </Link>
            </Button>
            <Button asChild variant="secondary" className="shadow-soft">
              <Link to="/meetings">
                <CalendarCheck className="h-4 w-4" /> Summarize notes
              </Link>
            </Button>
            <Button asChild variant="secondary" className="shadow-soft">
              <Link to="/tasks">
                <ClipboardList className="h-4 w-4" /> Plan my day
              </Link>
            </Button>
            <Button asChild variant="secondary" className="shadow-soft">
              <Link to="/chat">
                <MessageCircle className="h-4 w-4" /> Ask the assistant
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((c) => (
          <Link key={c.key} to={c.to} className="group">
            <Card className="h-full shadow-soft transition-shadow hover:shadow-elegant">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <c.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{stats[c.key] || 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent AI activity</CardTitle>
            <span className="text-xs text-muted-foreground">{history.length} saved</span>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No saved outputs yet. Generate an email, summary, plan, or research brief and
                click Save to see it here.
              </div>
            ) : (
              <ul className="divide-y">
                {history.slice(0, 5).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {KIND_LABELS[h.kind]} ·{" "}
                        {formatDistanceToNow(h.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">AI usage overview</CardTitle>
            <p className="text-xs text-muted-foreground">
              Total AI interactions so far this device.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-gradient">{total}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {STAT_CARDS.map((c) => (
                <li key={c.key} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <c.icon className="h-4 w-4" />
                    {c.label.split(" ")[0]}
                  </span>
                  <span className="font-medium">{stats[c.key] || 0}</span>
                </li>
              ))}
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                  Chat
                </span>
                <span className="font-medium">{stats.chat || 0}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
