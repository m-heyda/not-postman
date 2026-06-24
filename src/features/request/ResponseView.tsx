import { useState } from "react";
import { Code2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonacoEditor } from "@/lib/monaco/MonacoEditor";
import { cn, statusColor, tryFormatJson } from "@/lib/utils";
import { useRequestStore } from "./request.store";
import { useGenerateTypes } from "./hooks/useGenerateTypes";

type ResponseSubTab = "typescript" | "body" | "headers";

interface ResponseViewProps {
  onTypesGenerated?: () => void;
}

export function ResponseView({ onTypesGenerated }: ResponseViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<ResponseSubTab>("body");
  const response = useRequestStore((s) => s.response);
  const error = useRequestStore((s) => s.error);
  const isLoading = useRequestStore((s) => s.isLoading);
  const generated = useRequestStore((s) => s.generated);
  const generatedContent = useRequestStore((s) => s.generatedContent);
  const { generate, isGenerating, canGenerate } = useGenerateTypes();

  const handleGenerate = () => {
    generate(undefined, {
      onSuccess: () => {
        setActiveSubTab("typescript");
        onTypesGenerated?.();
      },
    });
  };

  const headerCount = response ? Object.keys(response.headers).length : 0;

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Sending request...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && !response && (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Hit Send to get a response.
        </div>
      )}

      {!isLoading && response && (
        <>
          <div className="flex items-center gap-2 px-1 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                response.status >= 200 && response.status < 300
                  ? "text-emerald-700 bg-emerald-50/60 border-emerald-200/70"
                  : response.status >= 400
                    ? "text-rose-600 bg-rose-50/60 border-rose-200/70"
                    : "text-amber-600 bg-amber-50/60 border-amber-200/70",
              )}
            >
              {response.status} {response.statusText}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {response.durationMs} ms
            </span>
            <span className="text-muted-foreground/40 text-[10px]">·</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {new Blob([response.body]).size >= 1024
                ? `${(new Blob([response.body]).size / 1024).toFixed(1)} KB`
                : `${new Blob([response.body]).size} B`}
            </span>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                disabled={!canGenerate || isGenerating}
                onClick={handleGenerate}
                title="Generate TypeScript types from this response"
              >
                <Code2 className="size-3" />
                {isGenerating ? "Generating…" : "Generate Types"}
              </Button>
            </div>
          </div>

          <Tabs
            value={activeSubTab}
            onValueChange={(v) => setActiveSubTab(v as ResponseSubTab)}
          >
            <TabsList>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="headers">
                Headers
                {headerCount > 0 && (
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    ({headerCount})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="typescript" className="mt-3">
              {generated?.typescript && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {generated.typescript}
                  </span>
                  {generatedContent && (
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Saved to disk
                    </span>
                  )}
                </div>
              )}
              {generatedContent ? (
                <div className="rounded-md border overflow-hidden">
                  <MonacoEditor
                    value={generatedContent}
                    language="typescript"
                    readOnly
                    height="300px"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No generated types yet. Click Generate Types to create
                  TypeScript from the response body.
                </p>
              )}
            </TabsContent>

            <TabsContent value="body" className="mt-3">
              <div className="rounded-md border overflow-hidden">
                <MonacoEditor
                  value={tryFormatJson(response.body)}
                  language="json"
                  readOnly
                  height="300px"
                />
              </div>
            </TabsContent>

            <TabsContent value="headers" className="mt-3">
              <div className="rounded-md border">
                <div className="grid grid-cols-[200px_1fr] gap-2 bg-muted/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Key</span>
                  <span>Value</span>
                </div>
                <ScrollArea className="max-h-64">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[200px_1fr] gap-2 border-t px-4 py-1.5 font-mono text-xs"
                    >
                      <span className="text-muted-foreground font-medium">
                        {key}
                      </span>
                      <span className="break-all">{value}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
