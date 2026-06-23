import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildTestApp } from "../../tests/build-test-app.js";

describe("workspace routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/workspace", () => {
    it("returns workspace info with collections", async () => {
      const res = await app.inject({ method: "GET", url: "/api/workspace" });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.name).toBe("not-postman");
      expect(body.data.collections).toBeDefined();
      expect(Array.isArray(body.data.collections)).toBe(true);
      const names = body.data.collections.map(
        (c: { name: string }) => c.name,
      );
      expect(names).toContain("Meowfacts");
      expect(names).toContain("httpbin");
    });
  });

  describe("GET /api/collections/*/tree", () => {
    it("returns tree for meowfacts collection", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/collections/meowfacts/tree",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(4);
      const methods = body.data
        .filter((n: { type: string }) => n.type === "request")
        .map((n: { method: string }) => n.method);
      expect(methods.every((m: string) => m === "GET")).toBe(true);
    });

    it("returns 404 for unknown collection", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/collections/nonexistent/tree",
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
