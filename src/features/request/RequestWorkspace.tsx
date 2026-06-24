import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExecuteResponse, Request } from "@/domain/models/request";
import { QueryParamsEditor } from "@/features/request/QueryParamsEditor";
import { RequestBar } from "@/features/request/RequestBar";
import { ResponsePanel } from "@/features/request/ResponsePanel";
import { useRequestStore } from "@/features/request/request.store";
import { EnvironmentSelector } from "@/features/environment/EnvironmentSelector";
import { useEnvironmentStore } from "@/features/environment/environment.store";
import { apiGet, apiPost, ApiClientError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const DEFAULT_REQUEST_PATH = "meowfacts/get-random-fact.yaml";

interface EnvironmentSummary {
  id: string;
  name: string;
}

interface EnvironmentDetail {
  id: string;
  name: string;
  variables: Record<string, string>;
}

async function loadRequest(path: string): Promise<Request> {
  return apiGet<Request>(`/api/requests/${path}`);
}

function useExecuteRequest() {
  const setLoading = useRequestStore((s) => s.setLoading);
  const setResponse = useRequestStore((s) => s.setResponse);
  const setError = useRequestStore((s) => s.setError);

  return useMutation({
    mutationFn: async (): Promise<ExecuteResponse> => {
      const state = useRequestStore.getState();
      const envId = useEnvironmentStore.getState().activeEnvironmentId;
      return apiPost<ExecuteResponse>("/api/execute", {
        method: state.method,
        url: state.url,
        headers: state.headers,
        query: state.query,
        body: {
          type: state.bodyType,
          content: state.bodyContent,
        },
        environment: envId,
      });
    },
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
}

export function RequestWorkspace() {
  const loadFromRequest = useRequestStore((s) => s.loadFromRequest);
  const name = useRequestStore((s) => s.name);

  const activeEnvironmentId = useEnvironmentStore(
    (s) => s.activeEnvironmentId,
  );
  const setEnvironments = useEnvironmentStore((s) => s.setEnvironments);
  const setActiveVariables = useEnvironmentStore((s) => s.setActiveVariables);

  const requestQuery = useQuery({
    queryKey: queryKeys.request(DEFAULT_REQUEST_PATH),
    queryFn: () => loadRequest(DEFAULT_REQUEST_PATH),
  });

  const envListQuery = useQuery({
    queryKey: queryKeys.environments,
    queryFn: () => apiGet<EnvironmentSummary[]>("/api/environments"),
  });

  const envDetailQuery = useQuery({
    queryKey: queryKeys.environment(activeEnvironmentId),
    queryFn: () =>
      apiGet<EnvironmentDetail>(`/api/environments/${activeEnvironmentId}`),
    enabled: !!activeEnvironmentId,
  });

  useEffect(() => {
    if (envListQuery.data) {
      setEnvironments(envListQuery.data);
    }
  }, [envListQuery.data, setEnvironments]);

  useEffect(() => {
    if (envDetailQuery.data) {
      setActiveVariables(envDetailQuery.data.variables);
    }
  }, [envDetailQuery.data, setActiveVariables]);

  useEffect(() => {
    if (requestQuery.data && name === "") {
      loadFromRequest(requestQuery.data, DEFAULT_REQUEST_PATH);
    }
  }, [requestQuery.data, name, loadFromRequest]);

  const executeMutation = useExecuteRequest();

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
          Failed to load request. Make sure the server is running.
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
        <EnvironmentSelector />
      </header>

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
        <ResponsePanel />
      </section>
    </div>
  );
}
