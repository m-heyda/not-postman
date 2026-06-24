import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestBar } from "@/features/request/RequestBar";
import { QueryParamsEditor } from "@/features/request/QueryParamsEditor";
import { PathParamsEditor } from "@/features/request/PathParamsEditor";
import { HeadersEditor } from "@/features/request/HeadersEditor";
import { BodyEditor } from "@/features/request/BodyEditor";
import { DocsEditor } from "@/features/request/DocsEditor";
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
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        <DocumentToolbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground/50">No request selected</p>
            <p className="text-xs text-muted-foreground/50">Pick a request from the sidebar or create a new one.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isRequestLoading) {
    return (
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        <DocumentToolbar />
        <div className="flex flex-1 items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-w-0 bg-background">
      <DocumentToolbar />
      <SaveStatusBar />

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        <RequestBar onSend={() => {
          onSend();
          setActiveTab("response");
        }} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
            <TabsTrigger value="params" className="text-xs">
              Params
              {queryCount > 0 && (
                <span className="ml-1 text-[9px] rounded-full bg-muted-foreground/15 text-muted-foreground px-1.5 min-w-[16px] text-center">
                  {queryCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="path" className="text-xs">
              Path
              {pathCount > 0 && (
                <span className="ml-1 text-[9px] rounded-full bg-muted-foreground/15 text-muted-foreground px-1.5 min-w-[16px] text-center">
                  {pathCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs">
              Headers
              {headerCount > 0 && (
                <span className="ml-1 text-[9px] rounded-full bg-muted-foreground/15 text-muted-foreground px-1.5 min-w-[16px] text-center">
                  {headerCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="body" className="text-xs">Body</TabsTrigger>
            <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
          </TabsList>

          {activeTab === "docs" && (
            <TabsContent value="docs" className="mt-2">
              <DocsEditor />
            </TabsContent>
          )}
          {activeTab === "params" && (
            <TabsContent value="params" className="mt-2">
              <QueryParamsEditor />
            </TabsContent>
          )}
          {activeTab === "path" && (
            <TabsContent value="path" className="mt-2">
              <PathParamsEditor />
            </TabsContent>
          )}
          {activeTab === "headers" && (
            <TabsContent value="headers" className="mt-2">
              <HeadersEditor />
            </TabsContent>
          )}
          {activeTab === "body" && (
            <TabsContent value="body" className="mt-2">
              <BodyEditor />
            </TabsContent>
          )}
          {activeTab === "response" && (
            <TabsContent value="response" className="mt-2">
              <ResponseView />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
