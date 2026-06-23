import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "./workspace.store";
import { CollectionTree } from "./CollectionTree";

interface SidebarProps {
  onNavigateSettings: () => void;
}

export function Sidebar({ onNavigateSettings }: SidebarProps) {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const trees = useWorkspaceStore((s) => s.trees);
  const selectedRequestPath = useWorkspaceStore((s) => s.selectedRequestPath);
  const setSelectedRequestPath = useWorkspaceStore(
    (s) => s.setSelectedRequestPath,
  );

  if (!workspace) {
    return (
      <div className="flex h-full w-[280px] shrink-0 items-center justify-center border-r">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-r">
      {/* Workspace header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold truncate">{workspace.name}</h2>
          {workspace.description && (
            <p className="text-[11px] text-muted-foreground truncate">
              {workspace.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={onNavigateSettings}
          title="Environments & Settings"
        >
          <Settings className="size-4" />
        </Button>
      </div>

      <Separator />

      {/* Section label */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Collections
        </span>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {workspace.collections.map((col) => {
            const tree = trees[col.path];
            if (!tree) return null;
            return (
              <CollectionTree
                key={col.path}
                collectionName={col.name}
                nodes={tree}
                selectedPath={selectedRequestPath}
                onSelectRequest={setSelectedRequestPath}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
