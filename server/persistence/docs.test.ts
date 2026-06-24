import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadDocs, saveDocs } from "./docs.js";
import { config } from "../config.js";
import path from "node:path";
import fs from "node:fs/promises";

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
    expect(result.path).toBe("get-items.md");
  });

  it("saves docs content to co-located .md file", async () => {
    const docsPath = path.join(
      FIXTURES_ROOT,
      "collections",
      "testapi",
      "get-items.md",
    );
    const originalDocs = await fs.readFile(docsPath, "utf-8");

    try {
      const saved = await saveDocs(
        "testapi/get-items.yaml",
        "# Get Items\n\nUpdated docs body.",
      );
      expect(saved.path).toBe("get-items.md");

      const reloaded = await loadDocs("testapi/get-items.yaml");
      expect(reloaded.content).toContain("Updated docs body.");
    } finally {
      await fs.writeFile(docsPath, originalDocs, "utf-8");
    }
  });

  it("throws for request with no .md file", async () => {
    await expect(
      loadDocs("testapi/subfolder/get-detail.yaml"),
    ).rejects.toThrow();
  });
});
