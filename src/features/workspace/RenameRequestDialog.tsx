import { useState, useEffect } from "react";
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
import { apiGet, apiPut } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { Request } from "@/domain/models/request";

interface RenameRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestPath: string;
  currentName: string;
  collectionPath: string;
}

export function RenameRequestDialog({
  open,
  onOpenChange,
  requestPath,
  currentName,
  collectionPath,
}: RenameRequestDialogProps) {
  const [name, setName] = useState(currentName);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const mutation = useMutation({
    mutationFn: async () => {
      const existing = await apiGet<Request>(`/api/requests/${requestPath}`);
      await apiPut(`/api/requests/${requestPath}`, {
        ...existing,
        name: name.trim(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.collectionTree(collectionPath),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.request(requestPath),
      });
      onOpenChange(false);
      toast.success("Request renamed");
    },
    onError: () => {
      toast.error("Failed to rename request");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Rename Request</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) mutation.mutate();
              if (e.key === "Escape") onOpenChange(false);
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={!name.trim() || name === currentName || mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
