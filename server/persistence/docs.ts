import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { assertSafeCollectionsPath } from "./path-utils.js";
import { AppError } from "../domain/error.js";

async function resolveDocsPath(
  requestRelativePath: string,
): Promise<string> {
  const requestFullPath = assertSafeCollectionsPath(requestRelativePath);
  const requestDir = path.dirname(requestFullPath);

  try {
    const raw = await fs.readFile(requestFullPath, "utf-8");
    const parsed = yaml.load(raw) as Record<string, unknown>;
    if (parsed && typeof parsed.docs === "string") {
      return path.resolve(requestDir, parsed.docs);
    }
  } catch {
    // fall through to sibling convention
  }

  const basename = path.basename(requestRelativePath, ".yaml");
  const dir = path.dirname(requestFullPath);
  return path.join(dir, `${basename}.md`);
}

export async function loadDocs(
  requestRelativePath: string,
): Promise<{ path: string; content: string }> {
  const docsFullPath = await resolveDocsPath(requestRelativePath);

  let content: string;
  try {
    content = await fs.readFile(docsFullPath, "utf-8");
  } catch {
    throw new AppError(
      "FILE_NOT_FOUND",
      `Documentation not found for: ${requestRelativePath}`,
      404,
    );
  }

  return {
    path: requestRelativePath.replace(/\.yaml$/, ".md"),
    content,
  };
}
