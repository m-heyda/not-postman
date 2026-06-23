import { describe, it, expect } from "vitest";
import { buildUrlWithQuery, buildHeaders } from "./build-url.js";

describe("buildUrlWithQuery", () => {
  it("appends enabled query params", () => {
    const url = buildUrlWithQuery("https://api.com/items", [
      { key: "limit", value: "10", enabled: true },
      { key: "offset", value: "0", enabled: true },
    ]);
    expect(url).toBe("https://api.com/items?limit=10&offset=0");
  });

  it("skips disabled params", () => {
    const url = buildUrlWithQuery("https://api.com/items", [
      { key: "limit", value: "10", enabled: true },
      { key: "debug", value: "true", enabled: false },
    ]);
    expect(url).toBe("https://api.com/items?limit=10");
  });

  it("skips params with empty keys", () => {
    const url = buildUrlWithQuery("https://api.com/items", [
      { key: "", value: "10", enabled: true },
    ]);
    expect(url).toBe("https://api.com/items");
  });

  it("handles empty params array", () => {
    expect(buildUrlWithQuery("https://api.com/items", [])).toBe(
      "https://api.com/items",
    );
  });
});

describe("buildHeaders", () => {
  it("builds header object from enabled pairs", () => {
    const headers = buildHeaders([
      { key: "Accept", value: "application/json", enabled: true },
      { key: "X-Debug", value: "true", enabled: false },
    ]);
    expect(headers).toEqual({ Accept: "application/json" });
  });

  it("skips empty keys", () => {
    const headers = buildHeaders([
      { key: "", value: "val", enabled: true },
    ]);
    expect(headers).toEqual({});
  });
});
