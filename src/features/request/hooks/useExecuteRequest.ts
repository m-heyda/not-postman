import { useMutation } from "@tanstack/react-query";
import type { ExecuteResponse, KeyValuePair } from "@/domain/models/request";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { useRequestStore } from "../request.store";
import { useEnvironmentStore } from "@/features/environment/environment.store";

function resolveVariables(
  url: string,
  vars: Record<string, string>,
): string {
  return url.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function buildQueryString(query: KeyValuePair[]): string {
  const enabled = query.filter((r) => r.enabled && r.key.trim());
  if (enabled.length === 0) return "";
  const params = new URLSearchParams();
  for (const r of enabled) params.append(r.key, r.value);
  return "?" + params.toString();
}

function buildHeaders(headers: KeyValuePair[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const h of headers) {
    if (h.enabled && h.key.trim()) result[h.key] = h.value;
  }
  return result;
}

async function executeDirectly(): Promise<ExecuteResponse> {
  const state = useRequestStore.getState();
  const vars = useEnvironmentStore.getState().activeVariables;

  const resolvedUrl = resolveVariables(state.url, vars);
  const qs = buildQueryString(state.query);
  const fullUrl = resolvedUrl + qs;
  const reqHeaders = buildHeaders(state.headers);

  const hasBody =
    state.bodyType !== "none" && state.bodyContent.trim().length > 0;
  if (state.bodyType === "json" && hasBody) {
    reqHeaders["Content-Type"] = "application/json";
  } else if (state.bodyType === "xml" && hasBody) {
    reqHeaders["Content-Type"] = "application/xml";
  } else if (state.bodyType === "text" && hasBody) {
    reqHeaders["Content-Type"] = "text/plain";
  }

  const start = performance.now();
  const response = await fetch(fullUrl, {
    method: state.method,
    headers: reqHeaders,
    body: hasBody ? state.bodyContent : undefined,
  });
  const durationMs = Math.round(performance.now() - start);

  const body = await response.text();
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body,
    durationMs,
  };
}

async function executeViaProxy(): Promise<ExecuteResponse> {
  const state = useRequestStore.getState();
  const envId = useEnvironmentStore.getState().activeEnvironmentId;
  return apiPost<ExecuteResponse>("/api/execute", {
    method: state.method,
    url: state.url,
    headers: state.headers,
    query: state.query,
    path: state.path,
    body: {
      type: state.bodyType,
      content: state.bodyContent,
    },
    environment: envId,
  });
}

export function useExecuteRequest() {
  const setLoading = useRequestStore((s) => s.setLoading);
  const setResponse = useRequestStore((s) => s.setResponse);
  const setError = useRequestStore((s) => s.setError);

  return useMutation({
    mutationFn: async (): Promise<ExecuteResponse> => {
      try {
        return await executeDirectly();
      } catch {
        // CORS or network error — fall back to server proxy
        return await executeViaProxy();
      }
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
