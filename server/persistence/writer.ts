import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import yaml from "js-yaml";
import { requestSchema } from "../../src/domain/schemas/request.schema.js";
import type { RequestSchema } from "../../src/domain/schemas/request.schema.js";
import { AppError } from "../domain/error.js";
import { assertSafeCollectionsPath } from "./path-utils.js";

/**
 * Atomically writes content to a file. Writes to a temp file in the same
 * directory then renames — on Windows, unlinks the target first since
 * rename-over-existing is not supported.
 */
export async function writeFileAtomic(
  fullPath: string,
  content: string,
): Promise<void> {
  const dir = path.dirname(fullPath);
  const tmpName = `.tmp-${crypto.randomBytes(6).toString("hex")}`;
  const tmpPath = path.join(dir, tmpName);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(tmpPath, content, "utf-8");

  try {
    if (os.platform() === "win32") {
      try {
        await fs.unlink(fullPath);
      } catch {
        // Target may not exist yet
      }
    }
    await fs.rename(tmpPath, fullPath);
  } catch (err) {
    // Clean up temp file on failure
    try {
      await fs.unlink(tmpPath);
    } catch {}
    throw err;
  }
}

const YAML_DUMP_OPTIONS: yaml.DumpOptions = {
  lineWidth: -1,
  noRefs: true,
  sortKeys: false,
  quotingType: '"',
};

export async function saveRequest(
  relativePath: string,
  request: unknown,
): Promise<RequestSchema> {
  const fullPath = assertSafeCollectionsPath(relativePath);

  const result = requestSchema.safeParse(request);
  if (!result.success) {
    throw new AppError(
      "SCHEMA_VALIDATION",
      "Request failed validation before save",
      422,
      { issues: result.error.issues },
    );
  }

  const validated = result.data;
  const yamlContent = yaml.dump(validated, YAML_DUMP_OPTIONS);
  await writeFileAtomic(fullPath, yamlContent);

  return validated;
}
