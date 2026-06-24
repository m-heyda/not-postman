import fs from "node:fs/promises";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { saveRequest } from "./writer.js";
import { loadRequestRaw } from "./reader.js";
import { config } from "../config.js";

const FIXTURES_ROOT = path.resolve(__dirname, "../../tests/fixtures");
const TEST_RELATIVE = "testapi/get-items.yaml";
const TEST_FULL = path.join(
  FIXTURES_ROOT,
  "collections",
  TEST_RELATIVE,
);

describe("saveRequest", () => {
  const originalRoot = config.workspaceRoot;
  let originalContent: string;

  beforeEach(async () => {
    (config as { workspaceRoot: string }).workspaceRoot = FIXTURES_ROOT;
    originalContent = await fs.readFile(TEST_FULL, "utf-8");
  });

  afterEach(async () => {
    await fs.writeFile(TEST_FULL, originalContent, "utf-8");
    (config as { workspaceRoot: string }).workspaceRoot = originalRoot;
  });

  it("round-trips description, docs pointer, and param descriptions", async () => {
    const payload = {
      version: 1 as const,
      kind: "request" as const,
      id: "test-request-get-items",
      name: "Get Items",
      description: "Fetch all items with **markdown**",
      method: "GET" as const,
      url: "{{testBaseUrl}}/items",
      headers: [
        {
          key: "Accept",
          value: "application/json",
          enabled: true,
          description: "Expected response format",
        },
      ],
      query: [
        {
          key: "limit",
          value: "10",
          enabled: true,
          description: "Maximum items to return",
        },
      ],
      path: [],
      body: { type: "none" as const },
      docs: "get-items.md",
    };

    await saveRequest(TEST_RELATIVE, payload);
    const reloaded = await loadRequestRaw(TEST_RELATIVE);

    expect(reloaded.description).toBe("Fetch all items with **markdown**");
    expect(reloaded.docs).toBe("get-items.md");
    expect(reloaded.query[0]?.description).toBe("Maximum items to return");
    expect(reloaded.headers[0]?.description).toBe("Expected response format");
  });
});
