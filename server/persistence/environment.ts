import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import {
  environmentSchema,
  type EnvironmentSchema,
} from "../../src/domain/schemas/environment.schema.js";
import type {
  EnvironmentSummary,
  Environment,
} from "../../src/domain/models/workspace.js";
import { AppError } from "../domain/error.js";
import { getEnvironmentsRoot } from "./path-utils.js";
import { resolveEnvVars } from "../executor/variables.js";

async function parseEnvironmentFile(
  filePath: string,
): Promise<EnvironmentSchema> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    throw new AppError(
      "FILE_NOT_FOUND",
      `Environment file not found: ${filePath}`,
      404,
    );
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YAML";
    throw new AppError("INVALID_YAML", message, 422);
  }

  const result = environmentSchema.safeParse(parsed);
  if (!result.success) {
    throw new AppError(
      "SCHEMA_VALIDATION",
      "Environment YAML failed validation",
      422,
      { issues: result.error.issues },
    );
  }

  return result.data;
}

export async function listEnvironments(): Promise<EnvironmentSummary[]> {
  const envRoot = getEnvironmentsRoot();
  let entries: string[];
  try {
    entries = await fs.readdir(envRoot);
  } catch {
    return [];
  }

  const summaries: EnvironmentSummary[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".yaml")) continue;
    const filePath = path.join(envRoot, entry);
    const env = await parseEnvironmentFile(filePath);
    summaries.push({ id: path.basename(entry, ".yaml"), name: env.name });
  }

  return summaries;
}

export async function loadEnvironment(
  environmentId: string,
): Promise<Environment> {
  const envRoot = getEnvironmentsRoot();
  const filePath = path.join(envRoot, `${environmentId}.yaml`);
  const env = await parseEnvironmentFile(filePath);

  const variables: Record<string, string> = {};
  for (const v of env.variables) {
    if (!v.enabled) continue;
    variables[v.key] = resolveEnvVars(v.value);
  }

  return {
    id: environmentId,
    name: env.name,
    variables,
  };
}

export async function loadEnvironmentVarMap(
  environmentId: string,
): Promise<Record<string, string>> {
  const env = await loadEnvironment(environmentId);
  return env.variables;
}
