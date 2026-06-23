import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironmentStore } from "@/features/environment/environment.store";

export function EnvironmentSelector() {
  const environments = useEnvironmentStore((s) => s.environments);
  const activeEnvironmentId = useEnvironmentStore((s) => s.activeEnvironmentId);
  const setActiveEnvironment = useEnvironmentStore(
    (s) => s.setActiveEnvironment,
  );

  if (environments.length === 0) {
    return (
      <span className="text-xs text-muted-foreground px-2 py-1 border rounded-md">
        No environments
      </span>
    );
  }

  return (
    <Select value={activeEnvironmentId} onValueChange={setActiveEnvironment}>
      <SelectTrigger className="w-[160px] text-xs font-medium" size="sm">
        <SelectValue placeholder="Environment" />
      </SelectTrigger>
      <SelectContent>
        {environments.map((env) => (
          <SelectItem key={env.id} value={env.id} className="text-xs">
            {env.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
