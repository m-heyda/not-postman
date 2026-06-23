import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Request } from "@/domain/models/request";
import type { DocsResponse } from "@/domain/models/workspace";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useRequestStore } from "../request.store";

export function useLoadRequest(requestPath: string | null) {
  const loadFromRequest = useRequestStore((s) => s.loadFromRequest);
  const setDocsContent = useRequestStore((s) => s.setDocsContent);

  const requestQuery = useQuery({
    queryKey: queryKeys.request(requestPath ?? ""),
    queryFn: () => apiGet<Request>(`/api/requests/${requestPath}`),
    enabled: !!requestPath,
  });

  const docsPath = requestPath?.replace(/\.yaml$/, "") ?? "";
  const docsQuery = useQuery({
    queryKey: queryKeys.docs(docsPath),
    queryFn: () => apiGet<DocsResponse>(`/api/docs/${docsPath}`),
    enabled: !!docsPath,
  });

  useEffect(() => {
    if (requestQuery.data && requestPath) {
      loadFromRequest(requestQuery.data, requestPath);
    }
  }, [requestQuery.data, requestPath, loadFromRequest]);

  useEffect(() => {
    if (docsQuery.data) {
      setDocsContent(docsQuery.data.content);
    } else if (docsQuery.isError) {
      setDocsContent("");
    }
  }, [docsQuery.data, docsQuery.isError, setDocsContent]);

  return {
    isLoading: requestQuery.isLoading,
    isFetching: requestQuery.isFetching,
    isError: requestQuery.isError,
  };
}
