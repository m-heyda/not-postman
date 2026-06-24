import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { METHOD_TEXT_COLORS } from "@/domain/constants/http-methods";
import { apiPut } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useWorkspaceStore } from "./workspace.store";
import { cn } from "@/lib/utils";

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Path prefix for the new request, e.g. "meowfacts/" or "myapi/subfolder/" */
  pathPrefix: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function NewRequestDialog({
  open,
  onOpenChange,
  pathPrefix,
}: NewRequestDialogProps) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [urlPath, setUrlPath] = useState("/");
  const queryClient = useQueryClient();
  const setSelectedRequestPath = useWorkspaceStore(
    (s) => s.setSelectedRequestPath,
  );

  // Derive the base URL variable name from the collection folder name
  // e.g. "meowfacts/" → "meowfactsBaseUrl"
  const collectionPath = pathPrefix.split("/")[0] ?? "";
  const baseUrlVar = collectionPath ? `${collectionPath}BaseUrl` : "";
  const baseUrlDisplay = baseUrlVar ? `{{${baseUrlVar}}}` : "";
  const fullUrl = baseUrlVar ? `{{${baseUrlVar}}}${urlPath}` : urlPath;

  const reset = () => {
    setName("");
    setMethod("GET");
    setUrlPath("/");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const slug = slugify(name) || "new-request";
      const requestPath = `${pathPrefix}${slug}.yaml`;
      await apiPut(`/api/requests/${requestPath}`, {
        version: 1,
        kind: "request",
        id: crypto.randomUUID(),
        name: name.trim(),
        method,
        url: fullUrl,
        headers: [],
        query: [],
        path: [],
        body: { type: "none" },
      });
      return requestPath;
    },
    onSuccess: (requestPath) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.collectionTree(collectionPath),
      });
      setSelectedRequestPath(requestPath);
      onOpenChange(false);
      reset();
      toast.success("Request created");
    },
    onError: () => {
      toast.error("Failed to create request");
    },
  });

  const handleSubmit = () => {
    if (name.trim()) mutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">New Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input
              placeholder="Get Users"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Method</label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as HttpMethod)}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((m) => (
                  <SelectItem
                    key={m}
                    value={m}
                    className={cn(
                      "font-mono font-semibold text-sm",
                      METHOD_TEXT_COLORS[m],
                    )}
                  >
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Endpoint path</label>
            <div className="flex items-center rounded-md border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/50">
              {baseUrlDisplay && (
                <span className="px-2.5 py-2 text-xs font-mono text-muted-foreground bg-muted/50 border-r shrink-0 select-none">
                  {baseUrlDisplay}
                </span>
              )}
              <input
                value={urlPath}
                onChange={(e) => {
                  let v = e.target.value;
                  if (!v.startsWith("/")) v = "/" + v;
                  setUrlPath(v);
                }}
                placeholder="/endpoint"
                className="flex-1 px-2.5 py-2 text-xs font-mono bg-transparent outline-none placeholder:text-muted-foreground/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </div>
          </div>

          {name.trim() && (
            <p className="text-[11px] text-muted-foreground font-mono">
              {pathPrefix}
              <span className="text-foreground/60">{slugify(name) || "new-request"}</span>
              .yaml
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
