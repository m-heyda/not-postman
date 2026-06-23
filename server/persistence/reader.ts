import fs from "node:fs/promises";
import yaml from "js-yaml";
import { requestSchema } from "../../src/domain/schemas/request.schema.js";
import type { RequestSchema } from "../../src/domain/schemas/request.schema.js";
import { AppError } from "../domain/error.js";
import { resolveVariables } from "../executor/variables.js";
import { assertSafeCollectionsPath } from "./path-utils.js";

export type { RequestSchema as ParsedRequest };

function resolveRequestFields(request: RequestSchema): RequestSchema {
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

function parseAndValidateYaml(raw: string, relativePath: string): RequestSchema {
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

  return result.data;
}

async function readRequestFile(relativePath: string): Promise<{ raw: string; fullPath: string }> {
  const fullPath = assertSafeCollectionsPath(relativePath);

  let raw: string;
  try {
    raw = await fs.readFile(fullPath, "utf-8");
  } catch {
    throw new AppError(
      "FILE_NOT_FOUND",
      `Request not found: ${relativePath}`,
      404,
    );
  }

  return { raw, fullPath };
}

export async function loadRequest(
  relativePath: string,
): Promise<RequestSchema> {
  const { raw } = await readRequestFile(relativePath);
  const validated = parseAndValidateYaml(raw, relativePath);
  return resolveRequestFields(validated);
}

export async function loadRequestRaw(
  relativePath: string,
): Promise<RequestSchema> {
  const { raw } = await readRequestFile(relativePath);
  return parseAndValidateYaml(raw, relativePath);
}

export async function listExampleRequests(): Promise<
  { path: string; name: string }[]
> {
  const examplesDir = assertSafeCollectionsPath("examples");
  let entries: string[];
  try {
    entries = await fs.readdir(examplesDir);
  } catch {
    return [];
  }

  const requests: { path: string; name: string }[] = [];

  for (const entry of entries) {
    if (!entry.endsWith(".yaml") || entry === "collection.yaml") continue;
    const relativePath = `examples/${entry}`;
    const request = await loadRequest(relativePath);
    requests.push({ path: relativePath, name: request.name });
  }

  return requests;
}
