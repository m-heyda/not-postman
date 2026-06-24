import { useState } from "react";
import { Save, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentSelector } from "@/features/environment/EnvironmentSelector";
import { useWorkspaceStore } from "@/features/workspace/workspace.store";
import { useRequestStore } from "@/features/request/request.store";
import { useSaveRequest } from "@/features/request/hooks/useSaveRequest";
import { toggleTheme, currentTheme } from "@/lib/theme";

export function DocumentToolbar() {
  const selectedPath = useWorkspaceStore((s) => s.selectedRequestPath);
  const savedRevision = useRequestStore((s) => s.savedRevision);
  const dirtyRevision = useRequestStore((s) => s.dirtyRevision);
  const isDocsDirty = useRequestStore((s) => s.isDocsDirty);
  const { save, isSaving, canSave } = useSaveRequest();
  const [theme, setTheme] = useState(currentTheme);

  const isDirty = dirtyRevision !== savedRevision || isDocsDirty();

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
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
      <div className="min-w-0 flex-1 flex items-center gap-2">
        {breadcrumb.length > 0 ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="opacity-30">/</span>}
                <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>
                  {seg}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Select a request</span>
        )}
        {isDirty && (
          <span className="text-[10px] text-muted-foreground/70 font-medium">· unsaved</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          disabled={!canSave || isSaving}
          onClick={() => save()}
        >
          <Save className="size-3" />
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(toggleTheme())}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          )}
        </Button>
        <EnvironmentSelector />
      </div>
    </div>
  );
}
