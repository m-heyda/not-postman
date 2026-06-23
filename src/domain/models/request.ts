export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface RequestBody {
  type: "none" | "json" | "text" | "xml" | "form-urlencoded" | "multipart";
  content?: string;
}

export interface Request {
  version: 1;
  kind: "request";
  id: string;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  query: KeyValuePair[];
  path: KeyValuePair[];
  body: RequestBody;
  docs?: string;
  meta?: {
    generatedType?: string;
    contractPath?: string;
  };
}

export interface ExecuteRequestPayload {
  method: HttpMethod;
  url: string;
  headers?: KeyValuePair[];
  query?: KeyValuePair[];
  body?: RequestBody;
}

export interface ExecuteResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ExampleRequestSummary {
  path: string;
  name: string;
}

export const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

export function createEmptyKeyValuePair(): KeyValuePair {
  return { key: "", value: "", enabled: true };
}
