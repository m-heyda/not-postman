import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadDocs, saveDocs } from "../persistence/docs.js";
import { AppError } from "../domain/error.js";

const saveDocsSchema = z.object({
  content: z.string(),
});

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

  app.put<{ Params: { "*": string } }>(
    "/api/docs/*",
    async (request) => {
      const relativePath = request.params["*"];
      if (!relativePath) {
        throw new AppError("FILE_NOT_FOUND", "Docs path required", 400);
      }

      const parsed = saveDocsSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new AppError(
          "SCHEMA_VALIDATION",
          "Invalid docs payload",
          422,
          { issues: parsed.error.issues },
        );
      }

      const yamlPath = relativePath.endsWith(".yaml")
        ? relativePath
        : `${relativePath}.yaml`;

      const saved = await saveDocs(yamlPath, parsed.data.content);
      return { data: saved };
    },
  );
}
