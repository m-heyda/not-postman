import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { listCollections, buildCollectionTree } from "./tree.js";
import { config } from "../config.js";
import path from "node:path";

const FIXTURES_ROOT = path.resolve(__dirname, "../../tests/fixtures");

describe("tree persistence", () => {
  const originalRoot = config.workspaceRoot;

  beforeEach(() => {
    (config as { workspaceRoot: string }).workspaceRoot = FIXTURES_ROOT;
  });

  afterEach(() => {
    (config as { workspaceRoot: string }).workspaceRoot = originalRoot;
  });

  describe("listCollections", () => {
    it("finds testapi collection from fixtures", async () => {
      const collections = await listCollections();
      expect(collections.length).toBeGreaterThanOrEqual(1);
      const names = collections.map((c) => c.name);
      expect(names).toContain("Test API");
    });
  });

  describe("buildCollectionTree", () => {
    it("builds tree with request nodes", async () => {
      const tree = await buildCollectionTree("testapi");
      const requestNodes = tree.filter((n) => n.type === "request");
      expect(requestNodes.length).toBeGreaterThanOrEqual(1);
    });

    it("attaches method to request nodes", async () => {
      const tree = await buildCollectionTree("testapi");
      const flat = flattenTree(tree);
      const requestNodes = flat.filter((n) => n.type === "request");
      for (const node of requestNodes) {
        if (node.type === "request") {
          expect(node.method).toBeDefined();
        }
      }
    });

    it("includes subfolder as folder node", async () => {
      const tree = await buildCollectionTree("testapi");
      const folderNodes = tree.filter((n) => n.type === "folder");
      expect(folderNodes.length).toBeGreaterThanOrEqual(1);
    });

    it("throws for unknown collection", async () => {
      await expect(buildCollectionTree("nonexistent")).rejects.toThrow();
    });
  });
});

function flattenTree(
  nodes: import("../../src/domain/models/workspace.js").CollectionTreeNode[],
): import("../../src/domain/models/workspace.js").CollectionTreeNode[] {
  const result: import("../../src/domain/models/workspace.js").CollectionTreeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.type === "folder") {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
