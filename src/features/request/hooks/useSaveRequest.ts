import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Request } from "@/domain/models/request";
import { ApiClientError, apiPut } from "@/lib/api/client";
import { useRequestStore } from "../request.store";

interface SaveDocsResponse {
  path: string;
}

export function useSaveRequest() {
  const sourcePath = useRequestStore((s) => s.sourcePath);
  const draftToRequest = useRequestStore((s) => s.draftToRequest);
  const markSaved = useRequestStore((s) => s.markSaved);
  const savedRevision = useRequestStore((s) => s.savedRevision);
  const dirtyRevision = useRequestStore((s) => s.dirtyRevision);
  const docsContent = useRequestStore((s) => s.docsContent);
  const savedDocsContent = useRequestStore((s) => s.savedDocsContent);

  const requestDirty = dirtyRevision !== savedRevision;
  const docsDirty = docsContent !== savedDocsContent;
  const canSave = !!sourcePath && (requestDirty || docsDirty);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sourcePath) throw new Error("No source path to save");
      const request = draftToRequest();
      if (!request) throw new Error("Cannot serialize draft");

      const savedPaths: string[] = [];

      await apiPut<Request>(`/api/requests/${sourcePath}`, request);
      savedPaths.push(sourcePath);

      if (docsContent !== useRequestStore.getState().savedDocsContent) {
        await apiPut<SaveDocsResponse>(`/api/docs/${sourcePath}`, {
          content: docsContent,
        });
        const docsPath =
          useRequestStore.getState().resolveDocsPath() ??
          `${sourcePath.replace(/\.yaml$/, "").split("/").pop()}.md`;
        savedPaths.push(sourcePath.replace(/[^/]+$/, docsPath));
      }

      return savedPaths;
    },
    onSuccess: (savedPaths) => {
      markSaved();
      toast.success(
        savedPaths.length > 1
          ? `Saved ${savedPaths.join(" and ")}`
          : `Saved ${savedPaths[0]}`,
      );
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save request");
      }
    },
  });

  return {
    save: mutation.mutate,
    isSaving: mutation.isPending,
    saveError: mutation.error,
    canSave,
  };
}
