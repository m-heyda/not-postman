import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { useRequestStore } from "../request.store";

interface TypeGenResult {
  typePath: string;
  typeName: string;
  content: string;
}

export function useGenerateTypes() {
  const sourcePath = useRequestStore((s) => s.sourcePath);
  const response = useRequestStore((s) => s.response);

  const isJsonResponse = (() => {
    if (!response?.body) return false;
    try {
      JSON.parse(response.body);
      return true;
    } catch {
      return false;
    }
  })();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sourcePath) throw new Error("No source path");
      if (!response?.body) throw new Error("No response body");
      return apiPost<TypeGenResult>("/api/generate-types", {
        requestPath: sourcePath,
        body: response.body,
      });
    },
  });

  return {
    generate: mutation.mutate,
    isGenerating: mutation.isPending,
    result: mutation.data ?? null,
    error: mutation.error,
    canGenerate: !!sourcePath && isJsonResponse,
  };
}
