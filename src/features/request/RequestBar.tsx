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
import { useRequestStore } from "@/features/request/request.store";
import { useEnvironmentStore } from "@/features/environment/environment.store";

interface RequestBarProps {
  onSend: () => void;
}

export function RequestBar({ onSend }: RequestBarProps) {
  const method = useRequestStore((s) => s.method);
  const baseUrlVar = useRequestStore((s) => s.baseUrlVar);
  const urlPath = useRequestStore((s) => s.urlPath);
  const isLoading = useRequestStore((s) => s.isLoading);
  const setMethod = useRequestStore((s) => s.setMethod);
  const setBaseUrlVar = useRequestStore((s) => s.setBaseUrlVar);
  const setUrlPath = useRequestStore((s) => s.setUrlPath);

  const activeVariables = useEnvironmentStore((s) => s.activeVariables);

  const domainVars = Object.entries(activeVariables).filter(([key]) =>
    key.toLowerCase().includes("baseurl") || key.toLowerCase().includes("base_url"),
  );

  const resolvedDomain = baseUrlVar ? (activeVariables[baseUrlVar] ?? `{{${baseUrlVar}}}`) : "";
  const hasUrl = !!(baseUrlVar || urlPath.trim());

  return (
    <div className="flex items-center gap-0">
      {/* Method */}
      <Select
        value={method}
        onValueChange={(value) => setMethod(value as HttpMethod)}
      >
        <SelectTrigger className="w-[100px] rounded-r-none border-r-0 font-mono font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HTTP_METHODS.map((m) => (
            <SelectItem key={m} value={m} className="font-mono">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Domain selector */}
      <Select value={baseUrlVar} onValueChange={setBaseUrlVar}>
        <SelectTrigger className="w-[220px] rounded-none border-r-0 font-mono text-xs text-muted-foreground">
          <SelectValue placeholder="Select domain..." />
        </SelectTrigger>
        <SelectContent>
          {domainVars.map(([key, value]) => (
            <SelectItem key={key} value={key} className="font-mono text-xs">
              <span className="font-medium">{key}</span>
              <span className="ml-2 text-muted-foreground truncate">
                {value}
              </span>
            </SelectItem>
          ))}
          {domainVars.length === 0 && (
            <SelectItem value="__none" disabled className="text-xs">
              No domains in environment
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Path input */}
      <Input
        value={urlPath}
        onChange={(e) => setUrlPath(e.target.value)}
        placeholder="/endpoint"
        className="flex-1 rounded-none border-r-0 font-mono text-sm"
        spellCheck={false}
      />

      {/* Send */}
      <Button
        onClick={onSend}
        disabled={isLoading || !hasUrl}
        className="rounded-l-none"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Send
      </Button>

      {/* Resolved preview */}
      {baseUrlVar && (
        <span className="ml-3 text-xs text-muted-foreground truncate max-w-[300px] hidden md:inline" title={resolvedDomain + urlPath}>
          {resolvedDomain}{urlPath}
        </span>
      )}
    </div>
  );
}
