import { useRequestStore } from "./request.store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DocsEditor() {
  const docsContent = useRequestStore((s) => s.docsContent);

  if (!docsContent) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No documentation available for this request.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="prose prose-sm dark:prose-invert max-w-none p-4">
        <pre className="whitespace-pre-wrap text-sm font-sans">{docsContent}</pre>
      </div>
    </ScrollArea>
  );
}
