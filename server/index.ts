import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import {
  registerErrorHandler,
  registerExecuteRoutes,
} from "./routes/execute.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerWorkspaceRoutes } from "./routes/workspace.js";
import { registerEnvironmentRoutes } from "./routes/environments.js";
import { registerDocsRoutes } from "./routes/docs.js";
import { registerRequestRoutes } from "./routes/requests.js";

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  registerErrorHandler(app);
  await registerHealthRoutes(app);
  await registerExecuteRoutes(app);
  await registerRequestRoutes(app);
  await registerWorkspaceRoutes(app);
  await registerEnvironmentRoutes(app);
  await registerDocsRoutes(app);

  return app;
}

async function start() {
  const app = await buildServer();

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Server listening on http://${config.host}:${config.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
