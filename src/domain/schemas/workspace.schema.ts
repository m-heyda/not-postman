import { z } from "zod";

export const workspaceSchema = z.object({
  version: z.literal(1),
  kind: z.literal("workspace"),
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type WorkspaceSchema = z.infer<typeof workspaceSchema>;

export const collectionMetaSchema = z.object({
  version: z.literal(1),
  kind: z.literal("collection"),
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export type CollectionMetaSchema = z.infer<typeof collectionMetaSchema>;
