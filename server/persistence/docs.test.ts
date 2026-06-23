import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadDocs } from "./docs.js";
import { config } from "../config.js";
import path from "node:path";

const FIXTURES_ROOT = path.resolve(__dirname, "../../tests/fixtures");

describe("docs persistence", () => {
  const originalRoot = config.workspaceRoot;

  beforeEach(() => {
    (config as { workspaceRoot: string }).workspaceRoot = FIXTURES_ROOT;
  });

  afterEach(() => {
    (config as { workspaceRoot: string }).workspaceRoot = originalRoot;
  });

  it("loads co-located .md file via docs field", async () => {
    const result = await loadDocs("testapi/get-items.yaml");
    expect(result.content).toContain("# Get Items");
    expect(result.path).toBe("testapi/get-items.md");
  });

  it("throws for request with no .md file", async () => {
    await expect(
      loadDocs("testapi/subfolder/get-detail.yaml"),
    ).rejects.toThrow();
  });
});
