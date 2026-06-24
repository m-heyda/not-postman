import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { assertSafeCollectionsPath } from "./path-utils.js";
import { AppError } from "../domain/error.js";
import { writeFileAtomic } from "./writer.js";

async function resolveDocsRelativePath(
  requestRelativePath: string,
): Promise<string> {
  const requestFullPath = assertSafeCollectionsPath(requestRelativePath);
  const requestDir = path.dirname(requestFullPath);
  const basename = path.basename(requestRelativePath, ".yaml");

  try {
    const raw = await fs.readFile(requestFullPath, "utf-8");
    const parsed = yaml.load(raw) as Record<string, unknown>;
    if (parsed && typeof parsed.docs === "string") {
      return parsed.docs;
    }
  } catch {
    // fall through to sibling convention
  }

  return `${basename}.md`;
}

function assertDocsPathWithinRequestDir(
  requestDir: string,
  docsRelativePath: string,
): string {
  const docsFullPath = path.resolve(requestDir, docsRelativePath);
  if (
    !docsFullPath.startsWith(requestDir + path.sep) &&
    docsFullPath !== requestDir
  ) {
    throw new AppError(
      "PATH_TRAVERSAL",
      "Docs path outside request directory",
      400,
    );
  }
  return docsFullPath;
}

async function resolveDocsPath(
  requestRelativePath: string,
): Promise<string> {
  const requestFullPath = assertSafeCollectionsPath(requestRelativePath);
  const requestDir = path.dirname(requestFullPath);
  const docsRelativePath = await resolveDocsRelativePath(requestRelativePath);
  return assertDocsPathWithinRequestDir(requestDir, docsRelativePath);
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

  const docsRelativePath = await resolveDocsRelativePath(requestRelativePath);
  return {
    path: docsRelativePath,
    content,
  };
}

export async function saveDocs(
  requestRelativePath: string,
  content: string,
): Promise<{ path: string }> {
  const requestFullPath = assertSafeCollectionsPath(requestRelativePath);
  const requestDir = path.dirname(requestFullPath);
  const docsRelativePath = await resolveDocsRelativePath(requestRelativePath);
  const docsFullPath = assertDocsPathWithinRequestDir(
    requestDir,
    docsRelativePath,
  );

  await writeFileAtomic(docsFullPath, content);
  return { path: docsRelativePath };
}
