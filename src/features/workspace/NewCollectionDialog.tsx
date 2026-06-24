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
import { apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface NewCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function NewCollectionDialog({
  open,
  onOpenChange,
}: NewCollectionDialogProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const slug = slugify(name);

  const reset = () => setName("");

  const mutation = useMutation({
    mutationFn: async () => {
      await apiPost("/api/collections", { name: name.trim(), slug });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace });
      onOpenChange(false);
      reset();
      toast.success("Collection created");
    },
    onError: () => {
      toast.error("Failed to create collection");
    },
  });

  const handleSubmit = () => {
    if (name.trim() && slug) mutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">New Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input
              placeholder="My API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {slug && (
              <p className="text-[11px] text-muted-foreground font-mono">
                collections/
                <span className="text-foreground/60">{slug}</span>/
              </p>
            )}
          </div>
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
            disabled={!name.trim() || !slug || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
