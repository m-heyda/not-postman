import { MarkdownField } from "./MarkdownField";
import { useRequestStore } from "./request.store";

export function DocsEditor() {
  const docsContent = useRequestStore((s) => s.docsContent);
  const setDocsContent = useRequestStore((s) => s.setDocsContent);
  const docsPath = useRequestStore((s) => s.docsPath);
  const sourcePath = useRequestStore((s) => s.sourcePath);

  const label =
    docsPath ??
    (sourcePath
      ? `${sourcePath.replace(/\.yaml$/, "").split("/").pop()}.md`
      : null);

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs text-muted-foreground">
          {docsPath ? "Docs file:" : "Docs will be saved to:"}{" "}
          <span className="font-mono">{label}</span>
        </p>
      )}
      <MarkdownField
        value={docsContent}
        onChange={setDocsContent}
        placeholder="Write request documentation in markdown…"
        minHeight="280px"
        emptyPreviewMessage="No documentation yet. Switch to Edit to add content."
      />
    </div>
  );
}
