export const queryKeys = {
  health: ["health"] as const,
  examples: ["examples"] as const,
  request: (path: string) => ["request", path] as const,
  workspace: ["workspace"] as const,
  environments: ["environments"] as const,
  environment: (id: string) => ["environment", id] as const,
};
