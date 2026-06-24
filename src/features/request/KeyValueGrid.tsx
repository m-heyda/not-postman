import { Lock, LockOpen, Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { KeyValuePair } from "@/domain/models/request";
import { cn } from "@/lib/utils";

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
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      {/* Column headers */}
      <div
        className={cn(
          "grid text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/40 px-2",
          showDescription
            ? "grid-cols-[20px_1fr_1fr_1fr_28px_28px]"
            : "grid-cols-[20px_1fr_1fr_28px_28px]",
        )}
      >
        <span className="py-2" />
        <span className="py-2 pl-1">Key</span>
        <span className="py-2 pl-1">Value</span>
        {showDescription && <span className="py-2 pl-1">Description</span>}
        <span className="py-2 text-center">On</span>
        <span />
      </div>

      {/* Data rows */}
      {rows.map((row, index) => (
        <div
          key={index}
          className={cn(
            "group/row grid items-center border-b border-border/30 px-2 transition-colors hover:bg-muted/20",
            !row.enabled && "opacity-50",
            showDescription
              ? "grid-cols-[20px_1fr_1fr_1fr_28px_28px]"
              : "grid-cols-[20px_1fr_1fr_28px_28px]",
          )}
        >
          {/* Lock toggle */}
          <button
            type="button"
            onClick={() => onUpdate(index, { locked: !row.locked })}
            className="flex items-center justify-center h-full py-1.5"
            title={
              row.locked
                ? "Value stored in localStorage only — click to unlock"
                : "Click to lock — value stored in localStorage only"
            }
          >
            {row.locked ? (
              <Lock className="size-3 text-amber-500" />
            ) : (
              <LockOpen className="size-3 text-muted-foreground/30 group-hover/row:text-muted-foreground/60 transition-colors" />
            )}
          </button>

          {/* Key */}
          <input
            value={row.key}
            onChange={(e) => onUpdate(index, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className="w-full py-1.5 pl-1 pr-2 text-xs font-mono bg-transparent outline-none placeholder:text-muted-foreground/30 focus:placeholder:text-muted-foreground/50"
          />

          {/* Value */}
          <input
            value={row.value}
            onChange={(e) => onUpdate(index, { value: e.target.value })}
            placeholder={row.locked ? "••••••••" : valuePlaceholder}
            type={row.locked ? "password" : "text"}
            className="w-full py-1.5 pl-1 pr-2 text-xs font-mono bg-transparent outline-none placeholder:text-muted-foreground/30 focus:placeholder:text-muted-foreground/50"
          />

          {/* Description */}
          {showDescription && (
            <input
              value={row.description ?? ""}
              onChange={(e) => onUpdate(index, { description: e.target.value })}
              placeholder="Note"
              className="w-full py-1.5 pl-1 pr-2 text-xs bg-transparent outline-none text-muted-foreground placeholder:text-muted-foreground/25 focus:placeholder:text-muted-foreground/40"
            />
          )}

          {/* Enabled checkbox */}
          <div className="flex justify-center items-center">
            <Checkbox
              checked={row.enabled}
              onCheckedChange={(checked) =>
                onUpdate(index, { enabled: checked === true })
              }
              className="size-3.5"
            />
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            aria-label="Remove row"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}

      {/* Add new row */}
      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-colors"
      >
        <Plus className="size-3" />
        Add row
      </button>
    </div>
  );
}
