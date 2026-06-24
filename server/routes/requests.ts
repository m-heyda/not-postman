import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import { z } from "zod";
import { AppError } from "../domain/error.js";
import { saveRequest } from "../persistence/writer.js";
import { generateAndSaveTypes } from "../persistence/typegen.js";
import { assertSafeCollectionsPath } from "../persistence/path-utils.js";

const typeGenSchema = z.object({
  body: z.string(),
  typeName: z.string().optional(),
  requestPath: z.string().min(1),
});

export async function registerRequestRoutes(app: FastifyInstance) {
  app.put<{ Params: { "*": string } }>(
    "/api/requests/*",
    async (request) => {
      const relativePath = request.params["*"];
      if (!relativePath) {
        throw new AppError("FILE_NOT_FOUND", "Request path required", 400);
      }

      const saved = await saveRequest(relativePath, request.body);
      return { data: saved };
    },
  );

  app.delete<{ Params: { "*": string } }>(
    "/api/requests/*",
    async (request) => {
      const relativePath = request.params["*"];
      if (!relativePath) {
        throw new AppError("FILE_NOT_FOUND", "Request path required", 400);
      }

      const fullPath = assertSafeCollectionsPath(relativePath);
      try {
        await fs.unlink(fullPath);
      } catch {
        throw new AppError("FILE_NOT_FOUND", "Request file not found", 404);
      }

      return { data: { deleted: relativePath } };
    },
  );

  app.post("/api/generate-types", async (request) => {
    const parsed = typeGenSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(
        "SCHEMA_VALIDATION",
        "Invalid type generation payload",
        422,
        { issues: parsed.error.issues },
      );
    }

    const result = await generateAndSaveTypes(
      parsed.data.requestPath,
      parsed.data.body,
      parsed.data.typeName,
    );

    return { data: result };
  });
}
