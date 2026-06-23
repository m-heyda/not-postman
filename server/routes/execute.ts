import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { keyValuePairSchema } from "../../src/domain/schemas/request.schema.js";
import { AppError, isAppError } from "../domain/error.js";
import { proxyRequest } from "../executor/proxy.js";
import { loadRequestRaw, listExampleRequests } from "../persistence/reader.js";

const executeSchema = z.object({
  method: z.enum([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
  ]),
  url: z.string().min(1),
  headers: z.array(keyValuePairSchema).optional(),
  query: z.array(keyValuePairSchema).optional(),
  path: z.array(keyValuePairSchema).optional(),
  body: z
    .object({
      type: z.enum(["none", "json", "text", "xml", "form-urlencoded", "multipart"]),
      content: z.string().optional(),
    })
    .optional(),
  environment: z.string().optional(),
});

export async function registerExecuteRoutes(app: FastifyInstance) {
  app.get("/api/examples", async () => {
    const examples = await listExampleRequests();
    return { data: examples };
  });

  app.get<{ Params: { "*": string } }>(
    "/api/requests/*",
    async (request) => {
      const relativePath = request.params["*"];
      if (!relativePath) {
        throw new AppError("FILE_NOT_FOUND", "Request path required", 400);
      }

      const data = await loadRequestRaw(relativePath);
      return { data };
    },
  );

  app.post("/api/execute", async (request) => {
    const parsed = executeSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(
        "SCHEMA_VALIDATION",
        "Invalid execute payload",
        422,
        { issues: parsed.error.issues },
      );
    }

    const data = await proxyRequest(parsed.data);
    return { data };
  });
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (isAppError(error)) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    console.error(error);
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  });
}
