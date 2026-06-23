import Fastify from "fastify";
import {
  registerErrorHandler,
  registerExecuteRoutes,
} from "../server/routes/execute.js";
import { registerHealthRoutes } from "../server/routes/health.js";
import { registerWorkspaceRoutes } from "../server/routes/workspace.js";
import { registerEnvironmentRoutes } from "../server/routes/environments.js";
import { registerDocsRoutes } from "../server/routes/docs.js";

export async function buildTestApp() {
  const app = Fastify({ logger: false });

  registerErrorHandler(app);
  await registerHealthRoutes(app);
  await registerExecuteRoutes(app);
  await registerWorkspaceRoutes(app);
  await registerEnvironmentRoutes(app);
  await registerDocsRoutes(app);

  return app;
}
