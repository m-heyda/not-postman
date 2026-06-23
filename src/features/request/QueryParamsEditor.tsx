import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/features/request/request.store";

export function QueryParamsEditor() {
  const query = useRequestStore((s) => s.query);
  const updateQueryRow = useRequestStore((s) => s.updateQueryRow);
  const addQueryRow = useRequestStore((s) => s.addQueryRow);
  const removeQueryRow = useRequestStore((s) => s.removeQueryRow);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_1fr_40px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
        <span>Key</span>
        <span>Value</span>
        <span className="text-center">On</span>
        <span />
      </div>

      {query.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_1fr_40px_40px] items-center gap-2"
        >
          <Input
            value={row.key}
            onChange={(e) =>
              updateQueryRow(index, { key: e.target.value })
            }
            placeholder="param"
            className="font-mono text-sm"
          />
          <Input
            value={row.value}
            onChange={(e) =>
              updateQueryRow(index, { value: e.target.value })
            }
            placeholder="value"
            className="font-mono text-sm"
          />
          <div className="flex justify-center">
            <Checkbox
              checked={row.enabled}
              onCheckedChange={(checked) =>
                updateQueryRow(index, { enabled: checked === true })
              }
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeQueryRow(index)}
            aria-label="Remove param"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addQueryRow}>
        <Plus className="size-4" />
        Add param
      </Button>
    </div>
  );
}
