import path from "node:path";
import { config } from "../config.js";
import { AppError } from "../domain/error.js";

export function assertSafeCollectionsPath(relativePath: string): string {
  const normalized = path.normalize(relativePath);

  if (normalized.includes("..")) {
    throw new AppError("PATH_TRAVERSAL", "Invalid request path", 400);
  }

  const collectionsRoot = path.resolve(config.workspaceRoot, "collections");
  const fullPath = path.resolve(collectionsRoot, normalized);

  if (!fullPath.startsWith(collectionsRoot + path.sep) && fullPath !== collectionsRoot) {
    throw new AppError(
      "PATH_TRAVERSAL",
      "Path outside collections directory",
      400,
    );
  }

  return fullPath;
}

export function getCollectionsRoot(): string {
  return path.resolve(config.workspaceRoot, "collections");
}

export function getEnvironmentsRoot(): string {
  return path.resolve(config.workspaceRoot, "environments");
}

export function getWorkspaceYamlPath(): string {
  return path.resolve(config.workspaceRoot, "workspace.yaml");
}
