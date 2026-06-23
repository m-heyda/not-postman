import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/features/workspace/Sidebar";
import { DocumentPanel } from "./DocumentPanel";
import { useWorkspaceData } from "@/features/workspace/hooks/useWorkspaceData";
import { useEnvironmentData } from "@/features/environment/hooks/useEnvironmentData";
import { useLoadRequest } from "@/features/request/hooks/useLoadRequest";
import { useExecuteRequest } from "@/features/request/hooks/useExecuteRequest";
import { useWorkspaceStore } from "@/features/workspace/workspace.store";

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

  useEffect(() => {
    if (workspace && !selectedRequestPath) {
      const firstCollection = workspace.collections[0];
      if (firstCollection) {
        setSelectedRequestPath(
          `${firstCollection.path}/get-random-fact.yaml`,
        );
      }
    }
  }, [workspace, selectedRequestPath, setSelectedRequestPath]);

  useLoadRequest(selectedRequestPath);
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
      <DocumentPanel onSend={() => executeMutation.mutate()} />
    </div>
  );
}
