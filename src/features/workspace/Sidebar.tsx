import { useState } from "react";
import { Settings, Loader2, FolderPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspaceStore } from "./workspace.store";
import { CollectionTree } from "./CollectionTree";
import { NewRequestDialog } from "./NewRequestDialog";
import { NewCollectionDialog } from "./NewCollectionDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { apiDelete } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface SidebarProps {
  onNavigateSettings: () => void;
  onEditCollection: (collectionPath: string) => void;
}

export function Sidebar({ onNavigateSettings, onEditCollection }: SidebarProps) {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const trees = useWorkspaceStore((s) => s.trees);
  const selectedRequestPath = useWorkspaceStore((s) => s.selectedRequestPath);
  const setSelectedRequestPath = useWorkspaceStore(
    (s) => s.setSelectedRequestPath,
  );

  const [addRequestPathPrefix, setAddRequestPathPrefix] = useState<string | null>(null);
  const [addCollectionOpen, setAddCollectionOpen] = useState(false);
  const [deleteCollectionPath, setDeleteCollectionPath] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const deleteCollectionMutation = useMutation({
    mutationFn: () =>
      apiDelete(`/api/collections/${deleteCollectionPath}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace });
      if (selectedRequestPath?.startsWith(`${deleteCollectionPath}/`)) {
        setSelectedRequestPath(null);
      }
      setDeleteCollectionPath(null);
      toast.success("Collection deleted");
    },
    onError: () => {
      toast.error("Failed to delete collection");
    },
  });

  const deleteCollectionName =
    workspace?.collections.find((c) => c.path === deleteCollectionPath)?.name ??
    deleteCollectionPath ??
    "";

  if (!workspace) {
    return (
      <div className="flex h-full w-[240px] shrink-0 items-center justify-center border-r">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-[240px] shrink-0 flex-col border-r bg-muted/20">
        {/* Workspace header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold truncate text-foreground">
              {workspace.name}
            </h2>
            {workspace.description && (
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {workspace.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onNavigateSettings}
            title="Environments & Settings"
          >
            <Settings className="size-3.5" />
          </Button>
        </div>

        {/* Collections list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-1.5 pt-2 pb-1">
            {workspace.collections.map((col) => {
              const tree = trees[col.path];
              if (!tree) return null;
              return (
                <CollectionTree
                  key={col.path}
                  collectionName={col.name}
                  collectionPath={col.path}
                  nodes={tree}
                  selectedPath={selectedRequestPath}
                  onSelectRequest={setSelectedRequestPath}
                  onEditCollection={onEditCollection}
                  onAddRequest={setAddRequestPathPrefix}
                  onDeleteCollection={setDeleteCollectionPath}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* Add collection footer */}
        <div className="border-t border-border/50 px-1.5 py-1.5">
          <button
            onClick={() => setAddCollectionOpen(true)}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <FolderPlus className="size-3 shrink-0" />
            <span>Add collection</span>
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <NewRequestDialog
        open={addRequestPathPrefix !== null}
        onOpenChange={(v) => {
          if (!v) setAddRequestPathPrefix(null);
        }}
        pathPrefix={addRequestPathPrefix ?? ""}
      />
      <NewCollectionDialog
        open={addCollectionOpen}
        onOpenChange={setAddCollectionOpen}
      />
      <ConfirmDialog
        open={deleteCollectionPath !== null}
        onOpenChange={(v) => {
          if (!v) setDeleteCollectionPath(null);
        }}
        title="Delete collection"
        description={`Delete "${deleteCollectionName}" and all its requests? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteCollectionMutation.isPending}
        onConfirm={() => deleteCollectionMutation.mutate()}
      />
    </>
  );
}
