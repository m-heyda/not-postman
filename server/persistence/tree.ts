import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import type { CollectionTreeNode } from "../../src/domain/models/workspace.js";
import type { HttpMethod } from "../../src/domain/models/request.js";
import { collectionMetaSchema } from "../../src/domain/schemas/workspace.schema.js";
import { getCollectionsRoot } from "./path-utils.js";
import { AppError } from "../domain/error.js";

interface CollectionInfo {
  id: string;
  name: string;
  path: string;
}

export async function listCollections(): Promise<CollectionInfo[]> {
  const collectionsRoot = getCollectionsRoot();
  let entries: string[];
  try {
    entries = await fs.readdir(collectionsRoot);
  } catch {
    return [];
  }

  const collections: CollectionInfo[] = [];
  for (const entry of entries) {
    const entryPath = path.join(collectionsRoot, entry);
    const stat = await fs.stat(entryPath);
    if (!stat.isDirectory()) continue;

    const collectionYaml = path.join(entryPath, "collection.yaml");
    try {
      const raw = await fs.readFile(collectionYaml, "utf-8");
      const parsed = yaml.load(raw);
      const result = collectionMetaSchema.safeParse(parsed);
      if (result.success) {
        collections.push({
          id: result.data.id,
          name: result.data.name,
          path: entry,
        });
      }
    } catch {
      collections.push({
        id: entry,
        name: entry,
        path: entry,
      });
    }
  }

  return collections;
}

async function extractMethodFromYaml(
  filePath: string,
): Promise<HttpMethod | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = yaml.load(raw) as Record<string, unknown>;
    if (parsed && typeof parsed.method === "string") {
      return parsed.method as HttpMethod;
    }
  } catch {
    // skip unreadable files
  }
  return null;
}

async function buildTreeRecursive(
  dirPath: string,
  relativeTo: string,
): Promise<CollectionTreeNode[]> {
  const entries = await fs.readdir(dirPath);
  const nodes: CollectionTreeNode[] = [];

  const sorted = [...entries].sort();

  for (const entry of sorted) {
    if (entry === "collection.yaml") continue;

    const fullPath = path.join(dirPath, entry);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      const children = await buildTreeRecursive(fullPath, relativeTo);
      if (children.length > 0) {
        nodes.push({ type: "folder", name: entry, children });
      }
    } else if (entry.endsWith(".yaml")) {
      const relPath = path
        .relative(relativeTo, fullPath)
        .replace(/\\/g, "/");
      const method = await extractMethodFromYaml(fullPath);
      if (method) {
        const name =
          await extractNameFromYaml(fullPath) ??
          entry.replace(/\.yaml$/, "");
        nodes.push({ type: "request", name, path: relPath, method });
      }
    }
  }

  return nodes;
}

async function extractNameFromYaml(
  filePath: string,
): Promise<string | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = yaml.load(raw) as Record<string, unknown>;
    if (parsed && typeof parsed.name === "string") {
      return parsed.name;
    }
  } catch {
    // skip
  }
  return null;
}

export async function buildCollectionTree(
  collectionPath: string,
): Promise<CollectionTreeNode[]> {
  const collectionsRoot = getCollectionsRoot();
  const dirPath = path.join(collectionsRoot, collectionPath);

  try {
    await fs.access(dirPath);
  } catch {
    throw new AppError(
      "FILE_NOT_FOUND",
      `Collection not found: ${collectionPath}`,
      404,
    );
  }

  return buildTreeRecursive(dirPath, collectionsRoot);
}
