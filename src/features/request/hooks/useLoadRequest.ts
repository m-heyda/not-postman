import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Request } from "@/domain/models/request";
import type { DocsResponse } from "@/domain/models/workspace";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useRequestStore } from "../request.store";

export function useLoadRequest(requestPath: string | null) {
  const loadFromRequest = useRequestStore((s) => s.loadFromRequest);
  const setDocsFromDisk = useRequestStore((s) => s.setDocsFromDisk);

  const requestQuery = useQuery({
    queryKey: queryKeys.request(requestPath ?? ""),
    queryFn: () => apiGet<Request>(`/api/requests/${requestPath}`),
    enabled: !!requestPath,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const docsPath = requestPath?.replace(/\.yaml$/, "") ?? "";
  const docsQuery = useQuery({
    queryKey: queryKeys.docs(docsPath),
    queryFn: () => apiGet<DocsResponse>(`/api/docs/${docsPath}`),
    enabled: !!docsPath,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (requestQuery.data && requestPath) {
      loadFromRequest(requestQuery.data, requestPath);
    }
  }, [requestQuery.data, requestPath, loadFromRequest]);

  useEffect(() => {
    if (!requestQuery.data) return;

    const legacyDescription = requestQuery.data.description;
    if (docsQuery.data) {
      setDocsFromDisk(docsQuery.data.content, legacyDescription);
    } else if (docsQuery.isError) {
      setDocsFromDisk("", legacyDescription);
    }
  }, [
    docsQuery.data,
    docsQuery.isError,
    requestQuery.data,
    setDocsFromDisk,
  ]);

  return {
    isLoading: requestQuery.isLoading,
    isFetching: requestQuery.isFetching,
    isError: requestQuery.isError,
  };
}
