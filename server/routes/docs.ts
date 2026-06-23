import type { FastifyInstance } from "fastify";
import { loadDocs } from "../persistence/docs.js";
import { AppError } from "../domain/error.js";

export async function registerDocsRoutes(app: FastifyInstance) {
  app.get<{ Params: { "*": string } }>(
    "/api/docs/*",
    async (request) => {
      const relativePath = request.params["*"];
      if (!relativePath) {
        throw new AppError("FILE_NOT_FOUND", "Docs path required", 400);
      }

      const yamlPath = relativePath.endsWith(".yaml")
        ? relativePath
        : `${relativePath}.yaml`;

      const docs = await loadDocs(yamlPath);
      return { data: docs };
    },
  );
}
