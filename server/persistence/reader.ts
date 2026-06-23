import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";
import { config } from "../config.js";
import { AppError } from "../domain/error.js";
import { resolveVariables } from "../executor/variables.js";

const keyValuePairSchema = z.object({
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
  description: z.string().optional(),
});

const requestBodySchema = z.object({
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
  headers: z.array(keyValuePairSchema).default([]),
  query: z.array(keyValuePairSchema).default([]),
  path: z.array(keyValuePairSchema).default([]),
  body: requestBodySchema,
  docs: z.string().optional(),
  meta: z
    .object({
      generatedType: z.string().optional(),
      contractPath: z.string().optional(),
    })
    .optional(),
});

export type ParsedRequest = z.infer<typeof requestSchema>;

function assertSafePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  if (normalized.includes("..")) {
    throw new AppError("PATH_TRAVERSAL", "Invalid request path", 400);
  }

  const fullPath = path.resolve(config.workspaceRoot, "collections", normalized);
  const collectionsRoot = path.resolve(config.workspaceRoot, "collections");

  if (!fullPath.startsWith(collectionsRoot)) {
    throw new AppError("PATH_TRAVERSAL", "Path outside collections directory", 400);
  }

  return fullPath;
}

function resolveRequestFields(request: ParsedRequest): ParsedRequest {
  return {
    ...request,
    url: resolveVariables(request.url),
    headers: request.headers.map((h) => ({
      ...h,
      value: resolveVariables(h.value),
    })),
    query: request.query.map((q) => ({
      ...q,
      value: resolveVariables(q.value),
    })),
    path: request.path.map((p) => ({
      ...p,
      value: resolveVariables(p.value),
    })),
  };
}

export async function loadRequest(relativePath: string): Promise<ParsedRequest> {
  const fullPath = assertSafePath(relativePath);

  let raw: string;
  try {
    raw = await fs.readFile(fullPath, "utf-8");
  } catch {
    throw new AppError("FILE_NOT_FOUND", `Request not found: ${relativePath}`, 404);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YAML";
    throw new AppError("INVALID_YAML", message, 422, { path: relativePath });
  }

  const result = requestSchema.safeParse(parsed);
  if (!result.success) {
    throw new AppError(
      "SCHEMA_VALIDATION",
      "Request YAML failed validation",
      422,
      { issues: result.error.issues },
    );
  }

  return resolveRequestFields(result.data);
}

export async function listExampleRequests(): Promise<
  { path: string; name: string }[]
> {
  const examplesDir = path.join(config.workspaceRoot, "collections", "examples");
  const entries = await fs.readdir(examplesDir);
  const requests: { path: string; name: string }[] = [];

  for (const entry of entries) {
    if (!entry.endsWith(".yaml") || entry === "collection.yaml") continue;
    const relativePath = path.join("examples", entry).replace(/\\/g, "/");
    const request = await loadRequest(relativePath);
    requests.push({ path: relativePath, name: request.name });
  }

  return requests;
}
