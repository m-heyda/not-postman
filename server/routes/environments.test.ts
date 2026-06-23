import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildTestApp } from "../../tests/build-test-app.js";

describe("environment routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/environments", () => {
    it("lists all environment files", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/environments",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body.data)).toBe(true);
      const ids = body.data.map((e: { id: string }) => e.id);
      expect(ids).toContain("development");
      expect(ids).toContain("staging");
      expect(ids).toContain("production");
    });
  });

  describe("GET /api/environments/:id", () => {
    it("returns resolved development environment", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/environments/development",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.name).toBe("Development");
      expect(body.data.variables.meowfactsBaseUrl).toBe(
        "https://meowfacts.herokuapp.com",
      );
      expect(body.data.variables.httpbinBaseUrl).toBe("https://httpbin.org");
    });

    it("returns 404 for missing environment", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/environments/nonexistent",
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
