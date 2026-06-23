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
import { DomainManagerDialog } from "@/features/environment/DomainManagerDialog";

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

  const domains = useEnvironmentStore((s) => s.domains);
  const activeVariables = useEnvironmentStore((s) => s.activeVariables);

  const selectedDomain = domains.find((d) => d.varKey === baseUrlVar);
  const resolvedUrl = baseUrlVar
    ? (activeVariables[baseUrlVar] ?? `{{${baseUrlVar}}}`)
    : "";
  const hasUrl = !!(baseUrlVar || urlPath.trim());

  return (
    <div className="space-y-1">
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
          <SelectTrigger className="w-[240px] rounded-none border-r-0 font-mono text-xs">
            <SelectValue placeholder="Select domain...">
              {selectedDomain ? (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">{selectedDomain.name}</span>
                  <span className="text-muted-foreground truncate text-[10px]">
                    {selectedDomain.url}
                  </span>
                </span>
              ) : baseUrlVar ? (
                <span className="text-amber-600">{`{{${baseUrlVar}}}`}</span>
              ) : (
                "Select domain..."
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => (
              <SelectItem
                key={d.varKey}
                value={d.varKey}
                className="font-mono text-xs"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium min-w-[80px]">{d.name}</span>
                  <span className="text-muted-foreground truncate">
                    {d.url}
                  </span>
                </span>
              </SelectItem>
            ))}
            {domains.length === 0 && (
              <SelectItem value="__none" disabled className="text-xs">
                No domains — open settings to add
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Domain manager button */}
        <div className="border-y px-1 flex items-center h-9">
          <DomainManagerDialog />
        </div>

        {/* Path input */}
        <Input
          value={urlPath}
          onChange={(e) => setUrlPath(e.target.value)}
          placeholder="/endpoint"
          className="flex-1 rounded-none border-l-0 border-r-0 font-mono text-sm"
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
      </div>

      {/* Resolved URL preview */}
      {resolvedUrl && (
        <p
          className="text-xs text-muted-foreground font-mono pl-[100px] truncate"
          title={resolvedUrl + urlPath}
        >
          {resolvedUrl}
          {urlPath}
        </p>
      )}
    </div>
  );
}
