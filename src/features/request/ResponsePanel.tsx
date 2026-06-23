import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExecuteResponse } from "@/domain/models/request";
import { cn, statusColor, tryFormatJson } from "@/lib/utils";

interface ResponsePanelProps {
  response: ExecuteResponse | null;
  error: string | null;
  isLoading: boolean;
}

export function ResponsePanel({
  response,
  error,
  isLoading,
}: ResponsePanelProps) {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sending request…
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
        Send a request to see the response here.
      </div>
    );
  }

  const formattedBody = tryFormatJson(response.body);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn("font-mono text-sm", statusColor(response.status))}
        >
          {response.status} {response.statusText}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {response.durationMs} ms
        </span>
        <span className="text-sm text-muted-foreground">
          {new Blob([response.body]).size.toLocaleString()} bytes
        </span>
      </div>

      <Tabs defaultValue="body">
        <TabsList>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>

        <TabsContent value="headers">
          <ScrollArea className="h-64 rounded-md border">
            <div className="space-y-2 p-4 font-mono text-xs">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[180px_1fr] gap-2">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="break-all">{value}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="body">
          <ScrollArea className="h-96 rounded-md border">
            <pre className="p-4 font-mono text-xs whitespace-pre-wrap break-words">
              {formattedBody}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
