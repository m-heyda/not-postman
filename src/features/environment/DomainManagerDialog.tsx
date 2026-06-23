import { useState } from "react";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEnvironmentStore, type Domain } from "./environment.store";

function AddDomainForm({ onAdd }: { onAdd: (domain: Domain) => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const varKey = name.trim()
    ? `${name.trim().replace(/\s+/g, "").replace(/BaseUrl$/i, "")}BaseUrl`
    : "";

  const canAdd = name.trim() && url.trim();

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({ varKey, name: name.trim(), url: url.trim() });
    setName("");
    setUrl("");
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-xs font-medium text-muted-foreground">Add domain</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. meowfacts)"
          className="text-sm"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com"
          className="text-sm font-mono"
        />
      </div>
      {varKey && (
        <p className="text-xs text-muted-foreground">
          Variable: <code className="bg-muted px-1 rounded">{`{{${varKey}}}`}</code>
        </p>
      )}
      <Button size="sm" onClick={handleAdd} disabled={!canAdd}>
        <Plus className="size-3.5" />
        Add
      </Button>
    </div>
  );
}

function DomainRow({
  domain,
  onRemove,
}: {
  domain: Domain;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{domain.name}</span>
          <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
            {domain.varKey}
          </code>
        </div>
        <p className="text-xs font-mono text-muted-foreground truncate">
          {domain.url}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 size-8 text-destructive hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function DomainManagerDialog() {
  const domains = useEnvironmentStore((s) => s.domains);
  const addDomain = useEnvironmentStore((s) => s.addDomain);
  const removeDomain = useEnvironmentStore((s) => s.removeDomain);
  const activeEnvironmentId = useEnvironmentStore((s) => s.activeEnvironmentId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Settings2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Domains</DialogTitle>
          <DialogDescription>
            Domains available in the <strong>{activeEnvironmentId}</strong> environment.
            Added domains are in-memory only for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {domains.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No domains configured.
            </p>
          )}
          {domains.map((domain) => (
            <DomainRow
              key={domain.varKey}
              domain={domain}
              onRemove={() => removeDomain(domain.varKey)}
            />
          ))}
        </div>

        <AddDomainForm onAdd={addDomain} />
      </DialogContent>
    </Dialog>
  );
}
