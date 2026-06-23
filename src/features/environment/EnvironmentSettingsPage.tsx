import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Environment } from "@/domain/models/workspace";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const ENVIRONMENTS = ["development", "staging", "production"] as const;

interface EnvironmentSettingsPageProps {
  onBack: () => void;
}

export function EnvironmentSettingsPage({
  onBack,
}: EnvironmentSettingsPageProps) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-semibold">Environments</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Environment variables are loaded from disk. Each environment file
            maps variable names to URLs. Switch between environments in the
            toolbar to resolve variables differently.
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
                <EnvironmentDetail envId={env} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EnvironmentDetail({ envId }: { envId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.environment(envId),
    queryFn: () => apiGet<Environment>(`/api/environments/${envId}`),
  });

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

  const variables = Object.entries(data.variables);

  if (variables.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No variables defined in this environment.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-[200px_1fr] gap-2 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>Variable</span>
        <span>Value</span>
      </div>
      <Separator />
      <ScrollArea className="max-h-[400px]">
        {variables.map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-[200px_1fr] gap-2 border-b last:border-0 px-4 py-2.5"
          >
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                {`{{${key}}}`}
              </code>
            </div>
            <span className="text-sm font-mono text-muted-foreground truncate">
              {value}
            </span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
