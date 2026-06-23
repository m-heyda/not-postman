import { useState } from "react";
import { ArrowLeft, Plus, Trash2, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Environment } from "@/domain/models/workspace";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useEnvironmentStore } from "./environment.store";

const ENVIRONMENTS = ["development", "staging", "production"] as const;

interface EnvironmentSettingsPageProps {
  onBack: () => void;
  initialCollection?: string | null;
}

export function EnvironmentSettingsPage({
  onBack,
  initialCollection,
}: EnvironmentSettingsPageProps) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-semibold">Environments</h1>
        {initialCollection && (
          <span className="text-sm text-muted-foreground">
            — {initialCollection}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Edit environment variables below. Changes are in-memory for this
            session. Switch between environments in the toolbar to resolve
            variables differently.
          </p>

          <Tabs defaultValue="development">
            <TabsList>
              {ENVIRONMENTS.map((env) => (
                <TabsTrigger key={env} value={env} className="capitalize">
                  {env}
                </TabsTrigger>
              ))}
            </TabsList>

            {ENVIRONMENTS.map((env) => (
              <TabsContent key={env} value={env} className="mt-4">
                <EnvironmentEditor envId={env} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EnvironmentEditor({ envId }: { envId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.environment(envId),
    queryFn: () => apiGet<Environment>(`/api/environments/${envId}`),
  });

  const activeEnvironmentId = useEnvironmentStore(
    (s) => s.activeEnvironmentId,
  );
  const activeVariables = useEnvironmentStore((s) => s.activeVariables);
  const overrides = useEnvironmentStore((s) => s.overrides);
  const setVariableOverride = useEnvironmentStore(
    (s) => s.setVariableOverride,
  );
  const removeVariableOverride = useEnvironmentStore(
    (s) => s.removeVariableOverride,
  );
  const addVariable = useEnvironmentStore((s) => s.addVariable);
  const removeVariable = useEnvironmentStore((s) => s.removeVariable);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const isActiveEnv = envId === activeEnvironmentId;
  const serverVars = data?.variables ?? {};

  const displayVars = isActiveEnv
    ? activeVariables
    : serverVars;

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Loading...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Failed to load environment.
      </p>
    );
  }

  const variables = Object.entries(displayVars);

  const handleAdd = () => {
    const k = newKey.trim();
    const v = newValue.trim();
    if (!k || !v) return;
    if (isActiveEnv) {
      addVariable(k, v);
    }
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_36px] gap-2 bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Variable</span>
          <span>Value</span>
          <span />
        </div>
        <Separator />

        {/* Rows */}
        <ScrollArea className="max-h-[400px]">
          {variables.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No variables defined.
            </p>
          )}
          {variables.map(([key, value]) => {
            const isOverridden = isActiveEnv && key in overrides;
            const originalValue = serverVars[key];
            return (
              <div
                key={key}
                className="grid grid-cols-[200px_1fr_36px] gap-2 border-b last:border-0 px-4 py-1.5 items-center"
              >
                <code className="text-xs font-mono truncate">{key}</code>
                {isActiveEnv ? (
                  <Input
                    value={value}
                    onChange={(e) =>
                      setVariableOverride(key, e.target.value)
                    }
                    className="h-7 text-xs font-mono border-0 shadow-none bg-transparent focus-visible:ring-1 px-1"
                  />
                ) : (
                  <span className="text-xs font-mono text-muted-foreground truncate px-1">
                    {value}
                  </span>
                )}
                <div className="flex justify-center">
                  {isActiveEnv && isOverridden && originalValue !== undefined ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        removeVariableOverride(key);
                        setVariableOverride(key, originalValue);
                      }}
                      title="Reset to disk value"
                    >
                      <RotateCcw className="size-3" />
                    </Button>
                  ) : isActiveEnv && !(key in serverVars) ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariable(key)}
                      title="Remove variable"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Add variable — only for active environment */}
      {isActiveEnv && (
        <div className="flex items-center gap-2">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="variableName"
            className="h-8 text-xs font-mono w-[200px]"
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="https://api.example.com"
            className="h-8 text-xs font-mono flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleAdd}
            disabled={!newKey.trim() || !newValue.trim()}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      )}

      {!isActiveEnv && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Switch to this environment in the toolbar to edit variables.
        </p>
      )}
    </div>
  );
}
