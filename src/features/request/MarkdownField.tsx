import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  emptyPreviewMessage?: string;
}

export function MarkdownField({
  value,
  onChange,
  placeholder = "Write markdown…",
  readOnly = false,
  minHeight = "120px",
  emptyPreviewMessage = "Nothing to preview.",
}: MarkdownFieldProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-center justify-between border-b px-2 py-1.5">
        <div className="flex gap-1">
          <Button
            type="button"
            variant={mode === "edit" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setMode("edit")}
            disabled={readOnly && mode === "preview"}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant={mode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setMode("preview")}
          >
            Preview
          </Button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ minHeight }}
          className={cn(
            "w-full resize-y bg-transparent px-3 py-2 text-sm font-mono",
            "focus:outline-none focus:ring-0",
            readOnly && "cursor-default opacity-80",
          )}
        />
      ) : (
        <div
          style={{ minHeight }}
          className="prose prose-sm dark:prose-invert max-w-none px-3 py-2"
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">{emptyPreviewMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
