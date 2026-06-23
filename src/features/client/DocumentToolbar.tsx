import { EnvironmentSelector } from "@/features/environment/EnvironmentSelector";
import { useWorkspaceStore } from "@/features/workspace/workspace.store";

export function DocumentToolbar() {
  const selectedPath = useWorkspaceStore((s) => s.selectedRequestPath);

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
      <div className="min-w-0 flex-1">
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
      </div>
      <EnvironmentSelector />
    </div>
  );
}
