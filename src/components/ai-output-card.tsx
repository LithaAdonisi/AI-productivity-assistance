import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Download, RotateCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { saveAiHistory, type HistoryItem } from "@/lib/usage-stats";

type Props = {
  title: string;
  content: string;
  loading?: boolean;
  emptyHint?: string;
  kind: HistoryItem["kind"];
  saveTitle?: string;
  onRegenerate?: () => void;
  onChange?: (next: string) => void;
};

export function AiOutputCard({
  title,
  content,
  loading,
  emptyHint,
  kind,
  saveTitle,
  onRegenerate,
  onChange,
}: Props) {
  const [tab, setTab] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(content);

  useEffect(() => setDraft(content), [content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExport = () => {
    const blob = new Blob([draft], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(saveTitle || title).toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!draft.trim()) return;
    saveAiHistory({ kind, title: saveTitle || title, content: draft });
    toast.success("Saved to history");
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!draft}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} disabled={!draft}>
            <Download className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Export</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={!draft}>
            <Save className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Save</span>
          </Button>
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={loading}>
              <RotateCw className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Regenerate</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : !draft ? (
          <p className="text-sm text-muted-foreground">{emptyHint || "Output will appear here."}</p>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "preview" | "edit")}>
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-3">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:tracking-tight prose-table:text-sm">
                <ReactMarkdown>{draft}</ReactMarkdown>
              </div>
            </TabsContent>
            <TabsContent value="edit" className="mt-3">
              <Textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  onChange?.(e.target.value);
                }}
                className="min-h-[320px] font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
