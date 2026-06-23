import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const treeQueries = collections.map((col) => {
    const query = useQuery({
      queryKey: queryKeys.collectionTree(col.path),
      queryFn: () =>
        apiGet<CollectionTreeNode[]>(`/api/collections/${col.path}/tree`),
      enabled: !!col.path,
    });
    return { collection: col, query };
  });

  useEffect(() => {
    for (const { collection, query } of treeQueries) {
      if (query.data) {
        setTree(collection.path, query.data);
      }
    }
  }, [treeQueries, setTree]);

  return {
    workspace,
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
  };
}
