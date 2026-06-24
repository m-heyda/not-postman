import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequestStore, type EditedSection } from "@/features/request/request.store";
import { useSaveRequest } from "@/features/request/hooks/useSaveRequest";

const SECTION_LABELS: Record<EditedSection, string> = {
  docs: "documentation",
  params: "query params",
  path: "path params",
  headers: "headers",
  body: "body",
  method: "method",
  url: "URL",
};

export function SaveStatusBar() {
  const savedRevision = useRequestStore((s) => s.savedRevision);
  const dirtyRevision = useRequestStore((s) => s.dirtyRevision);
  const lastEditedSection = useRequestStore((s) => s.lastEditedSection);
  const isDocsDirty = useRequestStore((s) => s.isDocsDirty);
  const { save, isSaving, canSave } = useSaveRequest();

  const isDirty = dirtyRevision !== savedRevision || isDocsDirty();
  if (!isDirty) return null;

  const sectionHint = lastEditedSection
    ? SECTION_LABELS[lastEditedSection]
    : isDocsDirty()
      ? "documentation"
      : "request";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-4 py-1.5">
      <p className="text-xs text-muted-foreground">
        Unsaved {sectionHint}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 text-xs"
        disabled={!canSave || isSaving}
        onClick={() => save()}
      >
        <Save className="size-3" />
        {isSaving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
