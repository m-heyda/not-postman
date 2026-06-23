import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentSelector } from "@/features/environment/EnvironmentSelector";
import { useWorkspaceStore } from "@/features/workspace/workspace.store";
import { useRequestStore } from "@/features/request/request.store";
import { useSaveRequest } from "@/features/request/hooks/useSaveRequest";

export function DocumentToolbar() {
  const selectedPath = useWorkspaceStore((s) => s.selectedRequestPath);
  const savedRevision = useRequestStore((s) => s.savedRevision);
  const dirtyRevision = useRequestStore((s) => s.dirtyRevision);
  const { save, isSaving, canSave } = useSaveRequest();

  const isDirty = dirtyRevision !== savedRevision;

  const breadcrumb = selectedPath
    ? selectedPath
        .replace(/\.yaml$/, "")
        .split("/")
        .map((seg) =>
          seg
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        )
    : [];

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b bg-muted/20">
      <div className="min-w-0 flex-1 flex items-center gap-3">
        {breadcrumb.length > 0 ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground/50">&gt;</span>}
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? "font-semibold text-foreground"
                      : ""
                  }
                >
                  {seg}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            Select a request
          </span>
        )}
        {isDirty && (
          <span className="text-[10px] text-amber-500 font-medium">
            Unsaved changes
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          disabled={!canSave || isSaving}
          onClick={() => save()}
        >
          <Save className="size-3" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <EnvironmentSelector />
      </div>
    </div>
  );
}
