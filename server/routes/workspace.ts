import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import yaml from "js-yaml";
import { workspaceSchema } from "../../src/domain/schemas/workspace.schema.js";
import { getWorkspaceYamlPath } from "../persistence/path-utils.js";
import { listCollections, buildCollectionTree } from "../persistence/tree.js";
import { AppError } from "../domain/error.js";

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
}
