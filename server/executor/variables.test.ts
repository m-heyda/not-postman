import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveEnvVars,
  resolveYamlVars,
  resolveWithEnvironment,
  findUnresolvedVars,
} from "./variables.js";

describe("resolveEnvVars", () => {
  beforeEach(() => {
    process.env.TEST_API_URL = "https://test.example.com";
  });

  afterEach(() => {
    delete process.env.TEST_API_URL;
  });

  it("resolves uppercase env vars", () => {
    expect(resolveEnvVars("{{TEST_API_URL}}/api")).toBe(
      "https://test.example.com/api",
    );
  });

  it("replaces missing env vars with empty string", () => {
    expect(resolveEnvVars("{{MISSING_VAR}}/api")).toBe("/api");
  });

  it("leaves non-env-var patterns unchanged", () => {
    expect(resolveEnvVars("{{camelCase}}")).toBe("{{camelCase}}");
  });
});

describe("resolveYamlVars", () => {
  it("resolves yaml variable placeholders", () => {
    const vars = { baseUrl: "https://api.com", version: "v2" };
    expect(resolveYamlVars("{{baseUrl}}/{{version}}/users", vars)).toBe(
      "https://api.com/v2/users",
    );
  });

  it("leaves unmatched vars intact", () => {
    expect(resolveYamlVars("{{unknown}}/path", {})).toBe("{{unknown}}/path");
  });
});

describe("resolveWithEnvironment", () => {
  beforeEach(() => {
    process.env.STAGING_URL = "https://staging.example.com";
  });

  afterEach(() => {
    delete process.env.STAGING_URL;
  });

  it("resolves yaml vars then env vars in chain", () => {
    const envVars = { meowfactsBaseUrl: "https://meowfacts.herokuapp.com" };
    expect(
      resolveWithEnvironment("{{meowfactsBaseUrl}}/", envVars),
    ).toBe("https://meowfacts.herokuapp.com/");
  });

  it("chains yaml var that contains env var indirection", () => {
    const envVars = { stagingUrl: "{{STAGING_URL}}" };
    expect(resolveWithEnvironment("{{stagingUrl}}/api", envVars)).toBe(
      "https://staging.example.com/api",
    );
  });
});

describe("findUnresolvedVars", () => {
  it("detects env-style and yaml-style vars", () => {
    const vars = findUnresolvedVars("{{baseUrl}}/{{API_KEY}}/{{baseUrl}}");
    expect(vars).toContain("baseUrl");
    expect(vars).toContain("API_KEY");
  });

  it("deduplicates results", () => {
    const vars = findUnresolvedVars("{{x}}/{{x}}");
    expect(vars).toEqual(["x"]);
  });

  it("returns empty for fully resolved string", () => {
    expect(findUnresolvedVars("https://example.com/api")).toEqual([]);
  });
});
