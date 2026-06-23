import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/features/workspace/Sidebar";
import { DocumentPanel } from "./DocumentPanel";
import { useWorkspaceData } from "@/features/workspace/hooks/useWorkspaceData";
import { useEnvironmentData } from "@/features/environment/hooks/useEnvironmentData";
import { useLoadRequest } from "@/features/request/hooks/useLoadRequest";
import { useExecuteRequest } from "@/features/request/hooks/useExecuteRequest";
import { useWorkspaceStore } from "@/features/workspace/workspace.store";
import {
  getRequestPathFromHash,
  setRequestPathInHash,
} from "@/lib/routing/hash-state";

interface ClientLayoutProps {
  onNavigateSettings: () => void;
  onEditCollection: (collectionPath: string) => void;
}

export function ClientLayout({
  onNavigateSettings,
  onEditCollection,
}: ClientLayoutProps) {
  const { isLoading, isError } = useWorkspaceData();
  useEnvironmentData();

  const selectedRequestPath = useWorkspaceStore(
    (s) => s.selectedRequestPath,
  );
  const workspace = useWorkspaceStore((s) => s.workspace);
  const setSelectedRequestPath = useWorkspaceStore(
    (s) => s.setSelectedRequestPath,
  );

  const initialized = useRef(false);

  // On mount only: restore selection from URL hash or pick default
  useEffect(() => {
    if (!workspace || initialized.current) return;
    initialized.current = true;

    const hashPath = getRequestPathFromHash();
    if (hashPath) {
      setSelectedRequestPath(hashPath);
    } else {
      const firstCollection = workspace.collections[0];
      if (firstCollection) {
        const defaultPath = `${firstCollection.path}/get-random-fact.yaml`;
        setSelectedRequestPath(defaultPath);
      }
    }
  }, [workspace, setSelectedRequestPath]);

  // Sync selection changes to URL hash (one-way: store → URL)
  useEffect(() => {
    if (selectedRequestPath) {
      setRequestPathInHash(selectedRequestPath);
    }
  }, [selectedRequestPath]);

  // Listen for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hashPath = getRequestPathFromHash();
      if (hashPath && hashPath !== useWorkspaceStore.getState().selectedRequestPath) {
        setSelectedRequestPath(hashPath);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setSelectedRequestPath]);

  const { isFetching: isRequestFetching } = useLoadRequest(selectedRequestPath);
  const executeMutation = useExecuteRequest();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="max-w-md text-center text-sm text-destructive">
          Failed to load workspace. Make sure the server is running.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        onNavigateSettings={onNavigateSettings}
        onEditCollection={onEditCollection}
      />
      <DocumentPanel
        onSend={() => executeMutation.mutate()}
        isRequestLoading={isRequestFetching}
      />
    </div>
  );
}
