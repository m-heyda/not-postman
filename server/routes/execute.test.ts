import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildTestApp } from "../../tests/build-test-app.js";

describe("execute routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/requests/*", () => {
    it("returns raw request without variable substitution", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/requests/meowfacts/get-random-fact.yaml",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.name).toBe("Random Fact");
      expect(body.data.url).toBe("{{meowfactsBaseUrl}}/");
      expect(body.data.method).toBe("GET");
    });

    it("returns 404 for missing request", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/requests/nonexistent/missing.yaml",
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/docs/*", () => {
    it("returns markdown docs for a request", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/docs/meowfacts/get-random-fact",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.content).toContain("# Random Fact");
    });

    it("returns 404 for missing docs", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/docs/meowfacts/nonexistent",
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/execute", () => {
    it("rejects invalid payload with 422", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/execute",
        payload: { method: "INVALID", url: "" },
      });
      expect(res.statusCode).toBe(422);
    });
  });
});
