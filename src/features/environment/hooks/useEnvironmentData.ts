import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EnvironmentSummary, Environment } from "@/domain/models/workspace";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useEnvironmentStore } from "../environment.store";

export function useEnvironmentData() {
  const activeEnvironmentId = useEnvironmentStore(
    (s) => s.activeEnvironmentId,
  );
  const setEnvironments = useEnvironmentStore((s) => s.setEnvironments);
  const setActiveVariables = useEnvironmentStore((s) => s.setActiveVariables);

  const envListQuery = useQuery({
    queryKey: queryKeys.environments,
    queryFn: () => apiGet<EnvironmentSummary[]>("/api/environments"),
  });

  const envDetailQuery = useQuery({
    queryKey: queryKeys.environment(activeEnvironmentId),
    queryFn: () =>
      apiGet<Environment>(`/api/environments/${activeEnvironmentId}`),
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

  return {
    isLoading: envListQuery.isLoading,
    isError: envListQuery.isError,
  };
}
