import { Loader2, Send, Trash2 } from "lucide-react";
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

interface RequestBarProps {
  onSend: () => void;
}

export function RequestBar({ onSend }: RequestBarProps) {
  const method = useRequestStore((s) => s.method);
  const url = useRequestStore((s) => s.url);
  const isLoading = useRequestStore((s) => s.isLoading);
  const setMethod = useRequestStore((s) => s.setMethod);
  const setUrl = useRequestStore((s) => s.setUrl);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={method}
        onValueChange={(value) => setMethod(value as HttpMethod)}
      >
        <SelectTrigger className="w-[110px] font-mono font-semibold">
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

      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        className="flex-1 font-mono text-sm"
        spellCheck={false}
      />

      <Button onClick={onSend} disabled={isLoading || !url.trim()}>
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Send
      </Button>
    </div>
  );
}

export { Trash2 };
