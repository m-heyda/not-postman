import { getAllEnv, getEnv } from "../config.js";

const ENV_VAR_PATTERN = /\{\{([A-Z_][A-Z0-9_]*)\}\}/g;
const YAML_VAR_PATTERN = /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g;

export function resolveEnvVars(value: string): string {
  return value.replace(ENV_VAR_PATTERN, (_match, name: string) => {
    return getEnv(name) ?? "";
  });
}

export function resolveYamlVars(
  value: string,
  yamlVars: Record<string, string>,
): string {
  let resolved = value;
  for (const [key, varValue] of Object.entries(yamlVars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    resolved = resolved.replace(pattern, varValue);
  }
  return resolved;
}

export function loadYamlVarMap(): Record<string, string> {
  // For setup phase, map yaml var keys to env-resolved values
  const env = getAllEnv();
  const map: Record<string, string> = {};

  if (env.JSONPLACEHOLDER_BASE_URL) {
    map.jsonplaceholderBaseUrl = env.JSONPLACEHOLDER_BASE_URL;
  }
  if (env.HTTPBIN_BASE_URL) {
    map.httpbinBaseUrl = env.HTTPBIN_BASE_URL;
  }

  return map;
}

export function resolveVariables(value: string): string {
  const yamlVars = loadYamlVarMap();
  const afterYaml = resolveYamlVars(value, yamlVars);
  return resolveEnvVars(afterYaml);
}

export function findUnresolvedVars(value: string): string[] {
  const unresolved: string[] = [];
  const patterns = [ENV_VAR_PATTERN, YAML_VAR_PATTERN];

  for (const pattern of patterns) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(value)) !== null) {
      unresolved.push(match[1]!);
    }
  }

  return [...new Set(unresolved)];
}
