import { useRequestStore } from "@/features/request/request.store";
import { KeyValueGrid } from "./KeyValueGrid";

export function HeadersEditor() {
  const headers = useRequestStore((s) => s.headers);
  const updateHeaderRow = useRequestStore((s) => s.updateHeaderRow);
  const addHeaderRow = useRequestStore((s) => s.addHeaderRow);
  const removeHeaderRow = useRequestStore((s) => s.removeHeaderRow);

  return (
    <KeyValueGrid
      rows={headers}
      onUpdate={updateHeaderRow}
      onAdd={addHeaderRow}
      onRemove={removeHeaderRow}
      keyPlaceholder="header"
      valuePlaceholder="value"
    />
  );
}
