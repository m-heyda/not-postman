import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HTTP_METHODS, type HttpMethod } from "@/domain/models/request";
import { METHOD_TEXT_COLORS } from "@/domain/constants/http-methods";
import { useRequestStore } from "@/features/request/request.store";
import { useEnvironmentStore } from "@/features/environment/environment.store";
import { cn } from "@/lib/utils";

interface RequestBarProps {
  onSend: () => void;
}

export function RequestBar({ onSend }: RequestBarProps) {
  const method = useRequestStore((s) => s.method);
  const baseUrlVar = useRequestStore((s) => s.baseUrlVar);
  const urlPath = useRequestStore((s) => s.urlPath);
  const isLoading = useRequestStore((s) => s.isLoading);
  const setMethod = useRequestStore((s) => s.setMethod);
  const setUrlPath = useRequestStore((s) => s.setUrlPath);
  const activeVariables = useEnvironmentStore((s) => s.activeVariables);

  const resolvedBase = baseUrlVar
    ? activeVariables[baseUrlVar] ?? ""
    : "";
  const hasUrl = !!(baseUrlVar || urlPath.trim());

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-0">
        {/* Method selector */}
        <Select
          value={method}
          onValueChange={(value) => setMethod(value as HttpMethod)}
        >
          <SelectTrigger
            className={cn(
              "w-[110px] rounded-r-none border-r-0 font-mono text-sm font-bold",
              METHOD_TEXT_COLORS[method],
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem
                key={m}
                value={m}
                className={cn("font-mono font-bold", METHOD_TEXT_COLORS[m])}
              >
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Base URL label (read-only, derived from collection) */}
        {baseUrlVar && resolvedBase && (
          <div className="flex items-center border-y bg-muted/40 px-3 h-9 text-xs font-mono text-muted-foreground shrink-0 select-none">
            <span className="truncate max-w-[220px]" title={resolvedBase}>
              {resolvedBase}
            </span>
          </div>
        )}

        {/* Path input — just the path portion */}
        <Input
          value={urlPath}
          onChange={(e) => setUrlPath(e.target.value)}
          placeholder="/endpoint"
          className={cn(
            "flex-1 rounded-none border-r-0 font-mono text-sm",
            !baseUrlVar && "rounded-l-none",
            baseUrlVar && resolvedBase && "border-l-0",
          )}
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hasUrl && !isLoading) onSend();
          }}
        />

        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={isLoading || !hasUrl}
          className="rounded-l-none px-6 font-semibold"
          size="default"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
