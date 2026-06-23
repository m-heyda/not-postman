import type {
  ExecuteRequestPayload,
  ExecuteResponse,
  KeyValuePair,
} from "../../src/domain/models/request.js";
import { AppError } from "../domain/error.js";
import { buildHeaders, buildUrlWithQuery } from "./build-url.js";
import { resolveWithEnvironment, resolveVariables } from "./variables.js";
import { applyPathParams } from "./apply-path.js";
import { loadEnvironmentVarMap } from "../persistence/environment.js";

const TIMEOUT_MS = 30_000;

interface ProxyPayload extends ExecuteRequestPayload {
  path?: KeyValuePair[];
  environment?: string;
}

function resolveValue(
  value: string,
  envVars: Record<string, string> | null,
): string {
  return envVars ? resolveWithEnvironment(value, envVars) : resolveVariables(value);
}

function resolveKvList(
  list: KeyValuePair[] | undefined,
  envVars: Record<string, string> | null,
): KeyValuePair[] {
  return (list ?? []).map((item) => ({
    ...item,
    value: resolveValue(item.value, envVars),
  }));
}

export async function proxyRequest(
  payload: ProxyPayload,
): Promise<ExecuteResponse> {
  let envVars: Record<string, string> | null = null;
  if (payload.environment) {
    try {
      envVars = await loadEnvironmentVarMap(payload.environment);
    } catch {
      // fall back to legacy resolution if env not found
    }
  }

  const resolvedUrl = resolveValue(payload.url, envVars);
  const resolvedHeaders = resolveKvList(payload.headers, envVars);
  const resolvedQuery = resolveKvList(payload.query, envVars);
  const resolvedPath = resolveKvList(payload.path, envVars);

  const afterPath = applyPathParams(resolvedUrl, resolvedPath);
  const finalUrl = buildUrlWithQuery(afterPath, resolvedQuery);
  const headers = buildHeaders(resolvedHeaders);

  let body: string | undefined;
  if (payload.body?.type !== "none" && payload.body?.content) {
    body = resolveValue(payload.body.content, envVars);
    if (payload.body.type === "json" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();

  try {
    const response = await fetch(finalUrl, {
      method: payload.method,
      headers,
      body:
        body && payload.method !== "GET" && payload.method !== "HEAD"
          ? body
          : undefined,
      signal: controller.signal,
      redirect: "follow",
    });

    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      durationMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(
        "PROXY_TIMEOUT",
        "Request timed out after 30 seconds",
        504,
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown network error";
    throw new AppError("PROXY_ERROR", message, 502);
  } finally {
    clearTimeout(timeout);
  }
}
