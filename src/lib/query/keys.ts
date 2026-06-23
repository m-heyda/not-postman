export const queryKeys = {
  health: ["health"] as const,
  examples: ["examples"] as const,
  request: (path: string) => ["request", path] as const,
};
