import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestBar } from "@/features/request/RequestBar";
import { QueryParamsEditor } from "@/features/request/QueryParamsEditor";
import { PathParamsEditor } from "@/features/request/PathParamsEditor";
import { HeadersEditor } from "@/features/request/HeadersEditor";
import { BodyEditor } from "@/features/request/BodyEditor";
import { DocsEditor } from "@/features/request/DocsEditor";
import { ResponsePanel } from "@/features/request/ResponsePanel";
import { MonacoEditor } from "@/lib/monaco/MonacoEditor";
import { useRequestStore } from "@/features/request/request.store";
import { DocumentToolbar } from "./DocumentToolbar";

interface DocumentPanelProps {
  onSend: () => void;
  isRequestLoading?: boolean;
}

function activeCount(rows: { key: string; enabled: boolean }[]): number {
  return rows.filter((r) => r.enabled && r.key.trim()).length;
}

export function DocumentPanel({ onSend, isRequestLoading }: DocumentPanelProps) {
  const [activeTab, setActiveTab] = useState("params");
  const response = useRequestStore((s) => s.response);
  const isLoading = useRequestStore((s) => s.isLoading);
  const error = useRequestStore((s) => s.error);
  const name = useRequestStore((s) => s.name);
  const query = useRequestStore((s) => s.query);
  const path = useRequestStore((s) => s.path);
  const headers = useRequestStore((s) => s.headers);
  const generatedContent = useRequestStore((s) => s.generatedContent);
  const generated = useRequestStore((s) => s.generated);

  const queryCount = activeCount(query);
  const pathCount = activeCount(path);
  const headerCount = activeCount(headers);

  if (!name && !isRequestLoading) {
    return (
      <div className="flex flex-1 flex-col min-w-0">
        <DocumentToolbar />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Select a request from the sidebar to get started.
        </div>
      </div>
    );
  }

  if (isRequestLoading) {
    return (
      <div className="flex flex-1 flex-col min-w-0">
        <DocumentToolbar />
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading request...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <DocumentToolbar />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <RequestBar onSend={onSend} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="params">
              Params
              {queryCount > 0 && (
                <span className="ml-1 text-[10px] rounded-full bg-primary/10 text-primary px-1.5 min-w-[18px] text-center">
                  {queryCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="path">
              Path
              {pathCount > 0 && (
                <span className="ml-1 text-[10px] rounded-full bg-primary/10 text-primary px-1.5 min-w-[18px] text-center">
                  {pathCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="headers">
              Headers
              {headerCount > 0 && (
                <span className="ml-1 text-[10px] rounded-full bg-primary/10 text-primary px-1.5 min-w-[18px] text-center">
                  {headerCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            {generatedContent && (
              <TabsTrigger value="types">
                Response Types
              </TabsTrigger>
            )}
          </TabsList>

          {activeTab === "docs" && (
            <TabsContent value="docs" className="mt-3">
              <DocsEditor />
            </TabsContent>
          )}
          {activeTab === "params" && (
            <TabsContent value="params" className="mt-3">
              <QueryParamsEditor />
            </TabsContent>
          )}
          {activeTab === "path" && (
            <TabsContent value="path" className="mt-3">
              <PathParamsEditor />
            </TabsContent>
          )}
          {activeTab === "headers" && (
            <TabsContent value="headers" className="mt-3">
              <HeadersEditor />
            </TabsContent>
          )}
          {activeTab === "body" && (
            <TabsContent value="body" className="mt-3">
              <BodyEditor />
            </TabsContent>
          )}
          {activeTab === "types" && generatedContent && (
            <TabsContent value="types" className="mt-3">
              {generated?.typescript && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {generated.typescript}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    Saved to disk
                  </span>
                </div>
              )}
              <div className="rounded-md border overflow-hidden">
                <MonacoEditor
                  value={generatedContent}
                  language="typescript"
                  readOnly
                  height="300px"
                />
              </div>
            </TabsContent>
          )}
        </Tabs>

        <Separator />

        <ResponsePanel
          response={response}
          error={error}
          isLoading={isLoading}
          onTypesGenerated={() => setActiveTab("types")}
        />
      </div>
    </div>
  );
}
