import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import yaml from "js-yaml";
import { workspaceSchema } from "../../src/domain/schemas/workspace.schema.js";
import path from "node:path";
import { getWorkspaceYamlPath, assertSafeCollectionsPath, getCollectionsRoot } from "../persistence/path-utils.js";
import { listCollections, buildCollectionTree } from "../persistence/tree.js";
import { writeFileAtomic } from "../persistence/writer.js";
import { AppError } from "../domain/error.js";

const YAML_DUMP_OPTIONS: yaml.DumpOptions = {
  lineWidth: -1,
  noRefs: true,
  sortKeys: false,
  quotingType: '"',
};

export async function registerWorkspaceRoutes(app: FastifyInstance) {
  app.get("/api/workspace", async () => {
    const wsPath = getWorkspaceYamlPath();
    let raw: string;
    try {
      raw = await fs.readFile(wsPath, "utf-8");
    } catch {
      throw new AppError("FILE_NOT_FOUND", "workspace.yaml not found", 404);
    }

    const parsed = yaml.load(raw);
    const result = workspaceSchema.safeParse(parsed);
    if (!result.success) {
      throw new AppError(
        "SCHEMA_VALIDATION",
        "workspace.yaml failed validation",
        422,
      );
    }

    const collections = await listCollections();

    return {
      data: {
        id: result.data.id,
        name: result.data.name,
        description: result.data.description,
        collections,
      },
    };
  });

  app.get<{ Params: { collectionPath: string } }>(
    "/api/collections/:collectionPath/tree",
    async (request) => {
      const { collectionPath } = request.params;
      if (!collectionPath) {
        throw new AppError(
          "FILE_NOT_FOUND",
          "Collection path required",
          400,
        );
      }
      const tree = await buildCollectionTree(collectionPath);
      return { data: tree };
    },
  );

  app.post("/api/collections", async (request) => {
    const body = request.body as { name?: string; slug?: string };
    const name = body.name?.trim();
    const slug = body.slug
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!name || !slug) {
      throw new AppError(
        "SCHEMA_VALIDATION",
        "name and slug are required",
        400,
      );
    }

    const collectionMeta = {
      version: 1,
      kind: "collection",
      id: crypto.randomUUID(),
      name,
    };

    const yamlContent = yaml.dump(collectionMeta, YAML_DUMP_OPTIONS);
    const fullPath = assertSafeCollectionsPath(`${slug}/collection.yaml`);
    await writeFileAtomic(fullPath, yamlContent);

    return { data: { path: slug, name } };
  });

  app.delete<{ Params: { collectionPath: string } }>(
    "/api/collections/:collectionPath",
    async (request) => {
      const { collectionPath } = request.params;
      if (!collectionPath) {
        throw new AppError("FILE_NOT_FOUND", "Collection path required", 400);
      }

      const collectionsRoot = getCollectionsRoot();
      const normalized = path.normalize(collectionPath);
      if (normalized.includes("..") || normalized.includes("/")) {
        throw new AppError("PATH_TRAVERSAL", "Invalid collection path", 400);
      }

      const fullPath = path.resolve(collectionsRoot, normalized);
      if (!fullPath.startsWith(collectionsRoot)) {
        throw new AppError("PATH_TRAVERSAL", "Path outside collections directory", 400);
      }

      try {
        await fs.rm(fullPath, { recursive: true, force: true });
      } catch {
        throw new AppError("FILE_NOT_FOUND", "Collection not found", 404);
      }

      return { data: { deleted: collectionPath } };
    },
  );
}
