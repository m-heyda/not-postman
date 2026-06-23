import { useRequestStore } from "@/features/request/request.store";
import { KeyValueGrid } from "./KeyValueGrid";

export function QueryParamsEditor() {
  const query = useRequestStore((s) => s.query);
  const updateQueryRow = useRequestStore((s) => s.updateQueryRow);
  const addQueryRow = useRequestStore((s) => s.addQueryRow);
  const removeQueryRow = useRequestStore((s) => s.removeQueryRow);

  return (
    <KeyValueGrid
      rows={query}
      onUpdate={updateQueryRow}
      onAdd={addQueryRow}
      onRemove={removeQueryRow}
      keyPlaceholder="param"
      valuePlaceholder="value"
    />
  );
}
