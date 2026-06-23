import type { KeyValuePair } from "../../src/domain/models/request.js";

export function applyPathParams(
  url: string,
  pathParams: KeyValuePair[] = [],
): string {
  let result = url;

  for (const param of pathParams) {
    if (!param.enabled || !param.key.trim()) continue;

    const colonPattern = new RegExp(`:${param.key}(?=[/?#]|$)`, "g");
    result = result.replace(colonPattern, encodeURIComponent(param.value));

    const bracePattern = new RegExp(`\\{\\{${param.key}\\}\\}`, "g");
    result = result.replace(bracePattern, encodeURIComponent(param.value));
  }

  return result;
}
