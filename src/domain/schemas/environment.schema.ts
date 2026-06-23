import { z } from "zod";

export const environmentVariableSchema = z.object({
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
  description: z.string().optional(),
});

export const environmentSchema = z.object({
  version: z.literal(1),
  kind: z.literal("environment"),
  id: z.string(),
  name: z.string(),
  variables: z.array(environmentVariableSchema),
});

export type EnvironmentSchema = z.infer<typeof environmentSchema>;
export type EnvironmentVariable = z.infer<typeof environmentVariableSchema>;
