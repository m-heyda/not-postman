import { MarkdownField } from "./MarkdownField";
import { useRequestStore } from "./request.store";

export function DescriptionEditor() {
  const description = useRequestStore((s) => s.description);
  const setDescription = useRequestStore((s) => s.setDescription);

  return (
    <MarkdownField
      value={description}
      onChange={setDescription}
      placeholder="Short summary (markdown supported)…"
      minHeight="80px"
      emptyPreviewMessage="No description yet."
    />
  );
}
