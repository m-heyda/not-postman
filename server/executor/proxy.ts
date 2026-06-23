import type {
  ExecuteRequestPayload,
  ExecuteResponse,
} from "../../src/domain/models/request.js";
import { AppError } from "../domain/error.js";
import { buildHeaders, buildUrlWithQuery } from "./build-url.js";
import { resolveVariables } from "./variables.js";

const TIMEOUT_MS = 30_000;

export async function proxyRequest(
  payload: ExecuteRequestPayload,
): Promise<ExecuteResponse> {
  const resolvedUrl = resolveVariables(payload.url);
  const resolvedHeaders = (payload.headers ?? []).map((h) => ({
    ...h,
    value: resolveVariables(h.value),
  }));
  const resolvedQuery = (payload.query ?? []).map((q) => ({
    ...q,
    value: resolveVariables(q.value),
  }));

  const finalUrl = buildUrlWithQuery(resolvedUrl, resolvedQuery);
  const headers = buildHeaders(resolvedHeaders);

  let body: string | undefined;
  if (payload.body?.type !== "none" && payload.body?.content) {
    body = resolveVariables(payload.body.content);
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
      body: body && payload.method !== "GET" && payload.method !== "HEAD"
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
