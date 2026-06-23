import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { listEnvironments, loadEnvironment } from "./environment.js";
import { config } from "../config.js";
import path from "node:path";

const FIXTURES_ROOT = path.resolve(__dirname, "../../tests/fixtures");

describe("environment persistence", () => {
  const originalRoot = config.workspaceRoot;

  beforeEach(() => {
    (config as { workspaceRoot: string }).workspaceRoot = FIXTURES_ROOT;
  });

  afterEach(() => {
    (config as { workspaceRoot: string }).workspaceRoot = originalRoot;
  });

  describe("listEnvironments", () => {
    it("lists environment files from fixtures", async () => {
      const envs = await listEnvironments();
      expect(envs.length).toBeGreaterThanOrEqual(2);
      const ids = envs.map((e) => e.id);
      expect(ids).toContain("development");
      expect(ids).toContain("staging");
    });
  });

  describe("loadEnvironment", () => {
    it("loads development env with resolved variables", async () => {
      const env = await loadEnvironment("development");
      expect(env.name).toBe("Development");
      expect(env.variables.testBaseUrl).toBe("https://dev.example.com");
    });

    it("excludes disabled variables", async () => {
      const env = await loadEnvironment("development");
      expect(env.variables).not.toHaveProperty("disabledVar");
    });

    it("resolves env var indirection in staging", async () => {
      process.env.TEST_STAGING_URL = "https://staging.test.com";
      const env = await loadEnvironment("staging");
      expect(env.variables.testBaseUrl).toBe("https://staging.test.com");
      delete process.env.TEST_STAGING_URL;
    });

    it("throws for missing environment", async () => {
      await expect(loadEnvironment("nonexistent")).rejects.toThrow();
    });
  });
});
