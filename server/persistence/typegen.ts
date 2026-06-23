import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { requestSchema } from "../../src/domain/schemas/request.schema.js";
import { AppError } from "../domain/error.js";
import { assertSafeCollectionsPath } from "./path-utils.js";
import { writeFileAtomic } from "./writer.js";

const MAX_PAYLOAD_BYTES = 512 * 1024;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toPascalCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map(capitalize)
    .join("");
}

function inferType(value: unknown, indent: number): string {
  if (value === null || value === undefined) return "unknown";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
  if (typeof value === "boolean") return "boolean";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemType = inferType(value[0], indent);
    return `${itemType}[]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "Record<string, unknown>";

    const pad = "  ".repeat(indent + 1);
    const closePad = "  ".repeat(indent);
    const fields = entries
      .map(([key, val]) => {
        const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : `"${key}"`;
        return `${pad}${safeName}: ${inferType(val, indent + 1)};`;
      })
      .join("\n");
    return `{\n${fields}\n${closePad}}`;
  }

  return "unknown";
}

export function generateTypeScript(json: unknown, typeName: string): string {
  const typeBody = inferType(json, 0);
  if (typeBody.startsWith("{")) {
    return `export interface ${typeName} ${typeBody}\n`;
  }
  return `export type ${typeName} = ${typeBody};\n`;
}

export interface TypeGenResult {
  typePath: string;
  typeName: string;
  content: string;
  sourceResponse?: string;
  sourceResponseContent?: string;
}

export async function generateAndSaveTypes(
  requestRelativePath: string,
  responseBody: string,
  requestedTypeName?: string,
): Promise<TypeGenResult> {
  if (Buffer.byteLength(responseBody, "utf-8") > MAX_PAYLOAD_BYTES) {
    throw new AppError(
      "PAYLOAD_TOO_LARGE",
      `Response body exceeds ${MAX_PAYLOAD_BYTES / 1024} KB limit`,
      413,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(responseBody);
  } catch {
    throw new AppError(
      "INVALID_JSON",
      "Response body is not valid JSON",
      422,
    );
  }

  const requestFullPath = assertSafeCollectionsPath(requestRelativePath);
  const requestDir = path.dirname(requestFullPath);
  const requestBasename = path.basename(requestRelativePath, ".yaml");

  // Derive type name
  const typeName = requestedTypeName
    ? toPascalCase(requestedTypeName)
    : toPascalCase(requestBasename) + "Response";

  // Generate TypeScript content
  const tsContent = generateTypeScript(json, typeName);

  // Write .ts file
  const typesDir = path.join(requestDir, "types");
  const tsFileName = `${typeName}.ts`;
  const tsFullPath = path.join(typesDir, tsFileName);
  await writeFileAtomic(tsFullPath, tsContent);

  // Write optional source response JSON
  const jsonFileName = `${requestBasename}.json`;
  const jsonFullPath = path.join(typesDir, jsonFileName);
  await writeFileAtomic(jsonFullPath, JSON.stringify(json, null, 2) + "\n");

  // Patch request YAML with generated block
  const typePath = `types/${tsFileName}`;
  const sourceResponsePath = `types/${jsonFileName}`;

  const rawYaml = await fs.readFile(requestFullPath, "utf-8");
  let parsed: unknown;
  try {
    parsed = yaml.load(rawYaml);
  } catch {
    throw new AppError("INVALID_YAML", "Cannot parse request YAML for patching", 422);
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

  const updated = {
    ...result.data,
    generated: {
      typescript: typePath,
      typeName,
      sourceResponse: sourceResponsePath,
    },
  };

  const updatedYaml = yaml.dump(updated, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
  });
  await writeFileAtomic(requestFullPath, updatedYaml);

  const sourceResponseContent = JSON.stringify(json, null, 2) + "\n";

  return {
    typePath,
    typeName,
    content: tsContent,
    sourceResponse: sourceResponsePath,
    sourceResponseContent,
  };
}
