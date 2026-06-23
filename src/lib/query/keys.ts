export const queryKeys = {
  health: ["health"] as const,
  examples: ["examples"] as const,
  request: (path: string) => ["request", path] as const,
  workspace: ["workspace"] as const,
  collectionTree: (path: string) => ["collection-tree", path] as const,
  environments: ["environments"] as const,
  environment: (id: string) => ["environment", id] as const,
  docs: (path: string) => ["docs", path] as const,
};
