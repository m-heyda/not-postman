import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonacoEditor } from "@/lib/monaco/MonacoEditor";
import { useRequestStore } from "./request.store";
import type { Request } from "@/domain/models/request";

const BODY_TYPES: { value: Request["body"]["type"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON" },
  { value: "text", label: "Text" },
  { value: "xml", label: "XML" },
];

export function BodyEditor() {
  const bodyType = useRequestStore((s) => s.bodyType);
  const bodyContent = useRequestStore((s) => s.bodyContent);
  const setBodyType = useRequestStore((s) => s.setBodyType);
  const setBodyContent = useRequestStore((s) => s.setBodyContent);

  return (
    <div className="space-y-3">
      <Select
        value={bodyType}
        onValueChange={(v) => setBodyType(v as Request["body"]["type"])}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BODY_TYPES.map((bt) => (
            <SelectItem key={bt.value} value={bt.value} className="text-xs">
              {bt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {bodyType !== "none" && (
        <div className="rounded-md border overflow-hidden">
          <MonacoEditor
            value={bodyContent}
            onChange={setBodyContent}
            language={bodyType === "json" ? "json" : bodyType === "xml" ? "xml" : "plaintext"}
            height="250px"
          />
        </div>
      )}

      {bodyType === "none" && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Select a body type to start editing
        </p>
      )}
    </div>
  );
}
