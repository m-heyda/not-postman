import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: "127.0.0.1",
  workspaceRoot: process.cwd(),
  corsOrigin: "http://localhost:5173",
} as const;

export function getEnv(name: string): string | undefined {
  return process.env[name];
}

export function getAllEnv(): Record<string, string | undefined> {
  return process.env;
}
