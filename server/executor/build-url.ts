import type { KeyValuePair } from "../../src/domain/models/request.js";

export function buildUrlWithQuery(
  baseUrl: string,
  query: KeyValuePair[] = [],
): string {
  const url = new URL(baseUrl);

  for (const param of query) {
    if (!param.enabled || !param.key.trim()) continue;
    url.searchParams.set(param.key, param.value);
  }

  return url.toString();
}

export function buildHeaders(
  headers: KeyValuePair[] = [],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const header of headers) {
    if (!header.enabled || !header.key.trim()) continue;
    result[header.key] = header.value;
  }

  return result;
}
