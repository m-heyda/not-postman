import { useMutation } from "@tanstack/react-query";
import type { ExecuteResponse } from "@/domain/models/request";
import { apiPost, ApiClientError } from "@/lib/api/client";
import { useRequestStore } from "../request.store";
import { useEnvironmentStore } from "@/features/environment/environment.store";

export function useExecuteRequest() {
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
        path: state.path,
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
