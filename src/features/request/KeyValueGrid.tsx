import { Lock, LockOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { KeyValuePair } from "@/domain/models/request";

interface KeyValueGridProps {
  rows: KeyValuePair[];
  onUpdate: (index: number, patch: Partial<KeyValuePair>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showDescription?: boolean;
}

export function KeyValueGrid({
  rows,
  onUpdate,
  onAdd,
  onRemove,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  showDescription = true,
}: KeyValueGridProps) {
  const gridCols = showDescription
    ? "grid-cols-[28px_1fr_1fr_1fr_36px_36px]"
    : "grid-cols-[28px_1fr_1fr_36px_36px]";

  return (
    <div className="space-y-0">
      {/* Header */}
      <div
        className={`grid ${gridCols} gap-1 border-b bg-muted/40 px-1 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider`}
      >
        <span />
        <span className="px-2">Key</span>
        <span className="px-2">Value</span>
        {showDescription && <span className="px-2">Description</span>}
        <span className="text-center">On</span>
        <span />
      </div>

      {/* Rows */}
      {rows.map((row, index) => (
        <div
          key={index}
          className={`grid ${gridCols} items-center gap-1 border-b px-1 py-0.5`}
        >
          <button
            type="button"
            className="flex items-center justify-center size-7 rounded hover:bg-muted/50 transition-colors"
            onClick={() => onUpdate(index, { locked: !row.locked })}
            aria-label={row.locked ? "Unlock value" : "Lock value"}
            title={
              row.locked
                ? "Value stored in localStorage (click to unlock)"
                : "Click to lock — value will be stored in localStorage only"
            }
          >
            {row.locked ? (
              <Lock className="size-3 text-amber-500" />
            ) : (
              <LockOpen className="size-3 text-muted-foreground/50" />
            )}
          </button>
          <Input
            value={row.key}
            onChange={(e) => onUpdate(index, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className="h-8 border-0 shadow-none bg-transparent font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          />
          <Input
            value={row.value}
            onChange={(e) => onUpdate(index, { value: e.target.value })}
            placeholder={row.locked ? "••••••••" : valuePlaceholder}
            type={row.locked ? "password" : "text"}
            className="h-8 border-0 shadow-none bg-transparent font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          />
          {showDescription && (
            <Input
              value={row.description ?? ""}
              onChange={(e) =>
                onUpdate(index, { description: e.target.value })
              }
              placeholder="Description"
              className="h-8 border-0 shadow-none bg-transparent text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            />
          )}
          <div className="flex justify-center">
            <Checkbox
              checked={row.enabled}
              onCheckedChange={(checked) =>
                onUpdate(index, { enabled: checked === true })
              }
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
            aria-label="Remove row"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}

      {/* Empty row placeholder for adding */}
      <div
        className={`grid ${gridCols} items-center gap-1 px-1 py-0.5 cursor-pointer hover:bg-muted/30 transition-colors`}
        onClick={onAdd}
      >
        <span />
        <Input
          placeholder={keyPlaceholder}
          className="h-8 border-0 shadow-none bg-transparent font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2 pointer-events-none"
          readOnly
          tabIndex={-1}
        />
        <Input
          placeholder={valuePlaceholder}
          className="h-8 border-0 shadow-none bg-transparent font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2 pointer-events-none"
          readOnly
          tabIndex={-1}
        />
        {showDescription && (
          <Input
            placeholder="Description"
            className="h-8 border-0 shadow-none bg-transparent text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2 pointer-events-none"
            readOnly
            tabIndex={-1}
          />
        )}
        <span />
        <span />
      </div>
    </div>
  );
}
