import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestBar } from "@/features/request/RequestBar";
import { QueryParamsEditor } from "@/features/request/QueryParamsEditor";
import { PathParamsEditor } from "@/features/request/PathParamsEditor";
import { HeadersEditor } from "@/features/request/HeadersEditor";
import { BodyEditor } from "@/features/request/BodyEditor";
import { DocsEditor } from "@/features/request/DocsEditor";
import { DescriptionEditor } from "@/features/request/DescriptionEditor";
import { ResponseView } from "@/features/request/ResponseView";
import { useRequestStore } from "@/features/request/request.store";
import { DocumentToolbar } from "./DocumentToolbar";
import { SaveStatusBar } from "./SaveStatusBar";

interface DocumentPanelProps {
  onSend: () => void;
  isRequestLoading?: boolean;
}

function activeCount(rows: { key: string; enabled: boolean }[]): number {
  return rows.filter((r) => r.enabled && r.key.trim()).length;
}

export function DocumentPanel({ onSend, isRequestLoading }: DocumentPanelProps) {
  const [activeTab, setActiveTab] = useState("params");
  const name = useRequestStore((s) => s.name);
  const query = useRequestStore((s) => s.query);
  const path = useRequestStore((s) => s.path);
  const headers = useRequestStore((s) => s.headers);

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
      <SaveStatusBar />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <RequestBar onSend={() => {
          onSend();
          setActiveTab("response");
        }} />

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </p>
          <DescriptionEditor />
        </div>

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
            <TabsTrigger value="response">Response</TabsTrigger>
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
          {activeTab === "response" && (
            <TabsContent value="response" className="mt-3">
              <ResponseView />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
