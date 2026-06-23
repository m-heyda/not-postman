import { describe, it, expect } from "vitest";
import { applyPathParams } from "./apply-path.js";

describe("applyPathParams", () => {
  it("substitutes colon-style path params", () => {
    const url = "https://api.example.com/users/:userId/posts/:postId";
    const result = applyPathParams(url, [
      { key: "userId", value: "42", enabled: true },
      { key: "postId", value: "7", enabled: true },
    ]);
    expect(result).toBe("https://api.example.com/users/42/posts/7");
  });

  it("substitutes brace-style path params", () => {
    const url = "https://api.example.com/users/{{userId}}";
    const result = applyPathParams(url, [
      { key: "userId", value: "42", enabled: true },
    ]);
    expect(result).toBe("https://api.example.com/users/42");
  });

  it("skips disabled path params", () => {
    const url = "https://api.example.com/users/:userId";
    const result = applyPathParams(url, [
      { key: "userId", value: "42", enabled: false },
    ]);
    expect(result).toBe("https://api.example.com/users/:userId");
  });

  it("skips params with empty keys", () => {
    const url = "https://api.example.com/users/:userId";
    const result = applyPathParams(url, [
      { key: "", value: "42", enabled: true },
    ]);
    expect(result).toBe("https://api.example.com/users/:userId");
  });

  it("leaves unknown segments unchanged", () => {
    const url = "https://api.example.com/users/:userId";
    const result = applyPathParams(url, [
      { key: "orderId", value: "99", enabled: true },
    ]);
    expect(result).toBe("https://api.example.com/users/:userId");
  });

  it("encodes special characters in values", () => {
    const url = "https://api.example.com/search/:query";
    const result = applyPathParams(url, [
      { key: "query", value: "hello world", enabled: true },
    ]);
    expect(result).toBe("https://api.example.com/search/hello%20world");
  });

  it("handles empty path params array", () => {
    const url = "https://api.example.com/users/:userId";
    expect(applyPathParams(url, [])).toBe(url);
    expect(applyPathParams(url)).toBe(url);
  });
});
