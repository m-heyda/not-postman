import { useMutation } from "@tanstack/react-query";
import type { Request } from "@/domain/models/request";
import { apiPut } from "@/lib/api/client";
import { useRequestStore } from "../request.store";

export function useSaveRequest() {
  const sourcePath = useRequestStore((s) => s.sourcePath);
  const draftToRequest = useRequestStore((s) => s.draftToRequest);
  const markSaved = useRequestStore((s) => s.markSaved);
  const isDirty = useRequestStore((s) => s.isDirty);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sourcePath) throw new Error("No source path to save");
      const request = draftToRequest();
      if (!request) throw new Error("Cannot serialize draft");
      return apiPut<Request>(`/api/requests/${sourcePath}`, request);
    },
    onSuccess: () => {
      markSaved();
    },
  });

  return {
    save: mutation.mutate,
    isSaving: mutation.isPending,
    saveError: mutation.error,
    canSave: !!sourcePath && isDirty(),
  };
}
