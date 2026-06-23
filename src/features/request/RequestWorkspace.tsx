import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ExampleRequestSummary,
  ExecuteResponse,
  Request,
} from "@/domain/models/request";
import { QueryParamsEditor } from "@/features/request/QueryParamsEditor";
import { RequestBar } from "@/features/request/RequestBar";
import { ResponsePanel } from "@/features/request/ResponsePanel";
import { useRequestStore } from "@/features/request/request.store";
import { apiGet, apiPost, ApiClientError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const DEFAULT_REQUEST_PATH = "meowfacts/get-random-fact.yaml";

async function loadRequest(path: string): Promise<Request> {
  return apiGet<Request>(`/api/requests/${path}`);
}

async function executeRequest(): Promise<ExecuteResponse> {
  const state = useRequestStore.getState();
  return apiPost<ExecuteResponse>("/api/execute", {
    method: state.method,
    url: state.url,
    headers: state.headers,
    query: state.query,
    body: {
      type: state.bodyType,
      content: state.bodyContent,
    },
  });
}

export function RequestWorkspace() {
  const loadFromRequest = useRequestStore((s) => s.loadFromRequest);
  const name = useRequestStore((s) => s.name);
  const response = useRequestStore((s) => s.response);
  const isLoading = useRequestStore((s) => s.isLoading);
  const error = useRequestStore((s) => s.error);
  const setLoading = useRequestStore((s) => s.setLoading);
  const setResponse = useRequestStore((s) => s.setResponse);
  const setError = useRequestStore((s) => s.setError);

  const requestQuery = useQuery({
    queryKey: queryKeys.request(DEFAULT_REQUEST_PATH),
    queryFn: () => loadRequest(DEFAULT_REQUEST_PATH),
  });

  const examplesQuery = useQuery({
    queryKey: queryKeys.examples,
    queryFn: () => apiGet<ExampleRequestSummary[]>("/api/examples"),
  });

  const executeMutation = useMutation({
    mutationFn: executeRequest,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setResponse(data);
      setLoading(false);
    },
    onError: (err: unknown) => {
      setLoading(false);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Request failed");
      }
    },
  });

  useEffect(() => {
    if (requestQuery.data && name === "") {
      loadFromRequest(requestQuery.data);
    }
  }, [requestQuery.data, name, loadFromRequest]);

  const handleLoadExample = async (path: string) => {
    try {
      const request = await loadRequest(path);
      loadFromRequest(request);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load example";
      setError(message);
    }
  };

  if (requestQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requestQuery.isError) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="max-w-md text-center text-sm text-destructive">
          Failed to load example request. Make sure the server is running and
          `.env` is configured.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">not-postman</h1>
          <p className="text-sm text-muted-foreground">
            {name || "Local-first API client"}
          </p>
        </div>
        <Badge variant="secondary">local env</Badge>
      </header>

      {examplesQuery.data && examplesQuery.data.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {examplesQuery.data.map((example) => (
            <Button
              key={example.path}
              variant="outline"
              size="sm"
              onClick={() => handleLoadExample(example.path)}
            >
              {example.name}
            </Button>
          ))}
        </div>
      )}

      <RequestBar onSend={() => executeMutation.mutate()} />

      <Tabs defaultValue="params">
        <TabsList>
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers" disabled>
            Headers
          </TabsTrigger>
          <TabsTrigger value="body" disabled>
            Body
          </TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="mt-4">
          <QueryParamsEditor />
        </TabsContent>

        <TabsContent value="headers" className="mt-4">
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </TabsContent>

        <TabsContent value="body" className="mt-4">
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </TabsContent>
      </Tabs>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Response</h2>
        <ResponsePanel
          response={response}
          error={error}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
