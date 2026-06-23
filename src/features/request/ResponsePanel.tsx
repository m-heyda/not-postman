import { useState } from "react";
import { Code2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonacoEditor } from "@/lib/monaco/MonacoEditor";
import type { ExecuteResponse } from "@/domain/models/request";
import { cn, statusColor, tryFormatJson } from "@/lib/utils";
import { useGenerateTypes } from "./hooks/useGenerateTypes";

interface ResponsePanelProps {
  response: ExecuteResponse | null;
  error: string | null;
  isLoading: boolean;
  onTypesGenerated?: () => void;
}

export function ResponsePanel({
  response,
  error,
  isLoading,
  onTypesGenerated,
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState("body");
  const { generate, isGenerating, canGenerate } = useGenerateTypes();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Sending request...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Hit the Send button to get a response.
      </div>
    );
  }

  const formattedBody = tryFormatJson(response.body);
  const bodySize = new Blob([response.body]).size;
  const headerCount = Object.keys(response.headers).length;

  const handleGenerate = () => {
    generate(undefined, {
      onSuccess: () => onTypesGenerated?.(),
    });
  };

  return (
    <div className="space-y-0">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-1 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Status:</span>
          <span
            className={cn("text-xs font-bold", statusColor(response.status))}
          >
            {response.status} {response.statusText}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Time:</span>
          <span className="text-xs font-semibold text-emerald-600">
            {response.durationMs} ms
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Size:</span>
          <span className="text-xs font-semibold text-emerald-600">
            {bodySize >= 1024
              ? `${(bodySize / 1024).toFixed(1)} KB`
              : `${bodySize} B`}
          </span>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
            title="Generate TypeScript types from this response"
          >
            <Code2 className="size-3" />
            {isGenerating ? "Generating..." : "Generate Types"}
          </Button>
        </div>
      </div>

      {/* Response tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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

        {activeTab === "body" && (
          <TabsContent value="body" className="mt-2">
            <div className="rounded-md border overflow-hidden">
              <MonacoEditor
                value={formattedBody}
                language="json"
                readOnly
                height="350px"
              />
            </div>
          </TabsContent>
        )}

        {activeTab === "headers" && (
          <TabsContent value="headers" className="mt-2">
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
        )}
      </Tabs>
    </div>
  );
}
