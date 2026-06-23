import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironmentStore } from "@/features/environment/environment.store";

const ENVIRONMENTS = [
  { id: "development", label: "Development" },
  { id: "staging", label: "Staging" },
  { id: "production", label: "Production" },
];

export function EnvironmentSelector() {
  const activeEnvironmentId = useEnvironmentStore(
    (s) => s.activeEnvironmentId,
  );
  const setActiveEnvironment = useEnvironmentStore(
    (s) => s.setActiveEnvironment,
  );

  return (
    <Select value={activeEnvironmentId} onValueChange={setActiveEnvironment}>
      <SelectTrigger className="w-[150px] text-xs font-medium" size="sm">
        <SelectValue placeholder="Environment" />
      </SelectTrigger>
      <SelectContent>
        {ENVIRONMENTS.map((env) => (
          <SelectItem key={env.id} value={env.id} className="text-xs">
            {env.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
