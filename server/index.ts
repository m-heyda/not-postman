import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import {
  registerErrorHandler,
  registerExecuteRoutes,
} from "./routes/execute.js";
import { registerHealthRoutes } from "./routes/health.js";

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  registerErrorHandler(app);
  await registerHealthRoutes(app);
  await registerExecuteRoutes(app);

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
