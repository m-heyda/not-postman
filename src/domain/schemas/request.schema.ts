import { z } from "zod";

export const keyValuePairSchema = z.object({
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
  description: z.string().optional(),
  locked: z.boolean().optional(),
});

export const requestBodySchema = z.object({
  type: z.enum([
    "none",
    "json",
    "text",
    "xml",
    "form-urlencoded",
    "multipart",
  ]),
  content: z.string().optional(),
});

export const generatedSchema = z.object({
  typescript: z.string(),
  typeName: z.string(),
  sourceResponse: z.string().optional(),
});

export const requestSchema = z.object({
  version: z.literal(1),
  kind: z.literal("request"),
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  method: z.enum([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
  ]),
  url: z.string(),
  headers: z.array(keyValuePairSchema),
  query: z.array(keyValuePairSchema),
  path: z.array(keyValuePairSchema),
  body: requestBodySchema,
  docs: z.string().optional(),
  generated: generatedSchema.optional(),
});

export type RequestSchema = z.infer<typeof requestSchema>;
