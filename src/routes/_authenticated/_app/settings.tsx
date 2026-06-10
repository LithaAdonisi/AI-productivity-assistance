import { createFileRoute } from "@tanstack/react-router";
import { Moon, Settings as SettingsIcon, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useTheme } from "@/hooks/use-theme";
import { clearHistory, clearStats } from "@/lib/usage-stats";
import { clearThreads } from "@/lib/chat-threads";

export const Route = createFileRoute("/_authenticated/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Everything is stored locally in your browser. Clearing data is irreversible."
      />
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" /> Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" /> Dark
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DangerRow
            title="Clear usage stats"
            description="Resets all counters on the dashboard."
            onClick={() => {
              clearStats();
              toast.success("Usage stats cleared");
            }}
          />
          <DangerRow
            title="Clear saved outputs"
            description="Removes all items in your AI activity history."
            onClick={() => {
              clearHistory();
              toast.success("Saved outputs cleared");
            }}
          />
          <DangerRow
            title="Clear chat threads"
            description="Deletes all conversations and messages."
            onClick={() => {
              clearThreads();
              toast.success("Chat threads cleared");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DangerRow({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button variant="destructive" size="sm" onClick={onClick}>
        <Trash2 className="h-4 w-4" /> Clear
      </Button>
    </div>
  );
}
