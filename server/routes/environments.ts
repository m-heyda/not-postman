import type { FastifyInstance } from "fastify";
import {
  listEnvironments,
  loadEnvironment,
} from "../persistence/environment.js";
import { AppError } from "../domain/error.js";

export async function registerEnvironmentRoutes(app: FastifyInstance) {
  app.get("/api/environments", async () => {
    const environments = await listEnvironments();
    return { data: environments };
  });

  app.get<{ Params: { id: string } }>(
    "/api/environments/:id",
    async (request) => {
      const { id } = request.params;
      if (!id) {
        throw new AppError("VALIDATION", "Environment ID required", 400);
      }
      const environment = await loadEnvironment(id);
      return { data: environment };
    },
  );
}
