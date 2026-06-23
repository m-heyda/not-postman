import { useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import type {
  WorkspaceInfo,
  CollectionTreeNode,
} from "@/domain/models/workspace";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useWorkspaceStore } from "../workspace.store";

export function useWorkspaceData() {
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const setTree = useWorkspaceStore((s) => s.setTree);
  const workspace = useWorkspaceStore((s) => s.workspace);

  const workspaceQuery = useQuery({
    queryKey: queryKeys.workspace,
    queryFn: () => apiGet<WorkspaceInfo>("/api/workspace"),
  });

  useEffect(() => {
    if (workspaceQuery.data) {
      setWorkspace(workspaceQuery.data);
    }
  }, [workspaceQuery.data, setWorkspace]);

  const collections = workspaceQuery.data?.collections ?? [];

  const treeQueries = useQueries({
    queries: collections.map((col) => ({
      queryKey: queryKeys.collectionTree(col.path),
      queryFn: () =>
        apiGet<CollectionTreeNode[]>(`/api/collections/${col.path}/tree`),
      enabled: !!col.path,
    })),
  });

  useEffect(() => {
    collections.forEach((col, i) => {
      const result = treeQueries[i];
      if (result?.data) {
        setTree(col.path, result.data);
      }
    });
  }, [treeQueries, collections, setTree]);

  return {
    workspace,
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
  };
}
