import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Editor = lazy(() => import("@monaco-editor/react"));

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

function LoadingFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export function MonacoEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "300px",
  className,
}: MonacoEditorProps) {
  return (
    <div className={className}>
      <Suspense fallback={<LoadingFallback />}>
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: "none",
            overviewRulerBorder: false,
            scrollbar: { verticalScrollbarSize: 8 },
          }}
        />
      </Suspense>
    </div>
  );
}
