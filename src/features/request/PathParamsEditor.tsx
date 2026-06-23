import { useRequestStore } from "@/features/request/request.store";
import { KeyValueGrid } from "./KeyValueGrid";

export function PathParamsEditor() {
  const path = useRequestStore((s) => s.path);
  const updatePathRow = useRequestStore((s) => s.updatePathRow);
  const addPathRow = useRequestStore((s) => s.addPathRow);
  const removePathRow = useRequestStore((s) => s.removePathRow);

  return (
    <KeyValueGrid
      rows={path}
      onUpdate={updatePathRow}
      onAdd={addPathRow}
      onRemove={removePathRow}
      keyPlaceholder=":param"
      valuePlaceholder="value"
    />
  );
}
