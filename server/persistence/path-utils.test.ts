import { describe, it, expect } from "vitest";
import { assertSafeCollectionsPath } from "./path-utils.js";

describe("assertSafeCollectionsPath", () => {
  it("accepts valid collection-relative paths", () => {
    const result = assertSafeCollectionsPath("meowfacts/get-random-fact.yaml");
    expect(result).toContain("collections");
    expect(result).toContain("meowfacts");
  });

  it("accepts nested paths", () => {
    const result = assertSafeCollectionsPath("testapi/subfolder/get-detail.yaml");
    expect(result).toContain("subfolder");
  });

  it("rejects path traversal with ../", () => {
    expect(() =>
      assertSafeCollectionsPath("../../../etc/passwd"),
    ).toThrow();
  });

  it("rejects paths escaping collections root", () => {
    expect(() =>
      assertSafeCollectionsPath("../../server/config.ts"),
    ).toThrow();
  });
});
