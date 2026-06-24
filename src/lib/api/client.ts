import type { ApiError } from "@/domain/models/request";

export class ApiClientError extends Error {
  constructor(public apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as { data?: T; error?: ApiError };

  if (!response.ok || json.error) {
    throw new ApiClientError(
      json.error ?? {
        code: "UNKNOWN_ERROR",
        message: response.statusText || "Request failed",
      },
    );
  }

  return json.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  return parseResponse<T>(response);
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

export async function apiPut<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  const response = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(path, { method: "DELETE" });
  return parseResponse<T>(response);
}
