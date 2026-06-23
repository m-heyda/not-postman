import { create } from "zustand";
import type {
  ExecuteResponse,
  HttpMethod,
  KeyValuePair,
  Request,
} from "@/domain/models/request";

const VAR_PATTERN = /^\{\{(\w+)\}\}(.*)/;

function splitUrl(url: string): { baseUrlVar: string; urlPath: string } {
  const match = url.match(VAR_PATTERN);
  if (match) {
    return { baseUrlVar: match[1]!, urlPath: match[2] ?? "" };
  }
  return { baseUrlVar: "", urlPath: url };
}

interface RequestDraftState {
  name: string;
  method: HttpMethod;
  url: string;
  baseUrlVar: string;
  urlPath: string;
  headers: KeyValuePair[];
  query: KeyValuePair[];
  bodyType: Request["body"]["type"];
  bodyContent: string;
  response: ExecuteResponse | null;
  isLoading: boolean;
  error: string | null;

  loadFromRequest: (request: Request) => void;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBaseUrlVar: (baseUrlVar: string) => void;
  setUrlPath: (urlPath: string) => void;
  setQuery: (query: KeyValuePair[]) => void;
  updateQueryRow: (index: number, patch: Partial<KeyValuePair>) => void;
  addQueryRow: () => void;
  removeQueryRow: (index: number) => void;
  setResponse: (response: ExecuteResponse | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

function buildUrl(baseUrlVar: string, urlPath: string): string {
  if (baseUrlVar) return `{{${baseUrlVar}}}${urlPath}`;
  return urlPath;
}

export const useRequestStore = create<RequestDraftState>((set) => ({
  name: "",
  method: "GET",
  url: "",
  baseUrlVar: "",
  urlPath: "",
  headers: [],
  query: [],
  bodyType: "none",
  bodyContent: "",
  response: null,
  isLoading: false,
  error: null,

  loadFromRequest: (request) => {
    const { baseUrlVar, urlPath } = splitUrl(request.url);
    set({
      name: request.name,
      method: request.method,
      url: request.url,
      baseUrlVar,
      urlPath,
      headers: request.headers,
      query: request.query.length
        ? request.query
        : [{ key: "", value: "", enabled: true }],
      bodyType: request.body.type,
      bodyContent: request.body.content ?? "",
      response: null,
      error: null,
    });
  },

  setMethod: (method) => set({ method }),

  setUrl: (url) => {
    const { baseUrlVar, urlPath } = splitUrl(url);
    set({ url, baseUrlVar, urlPath });
  },

  setBaseUrlVar: (baseUrlVar) =>
    set((state) => ({
      baseUrlVar,
      url: buildUrl(baseUrlVar, state.urlPath),
    })),

  setUrlPath: (urlPath) =>
    set((state) => ({
      urlPath,
      url: buildUrl(state.baseUrlVar, urlPath),
    })),

  setQuery: (query) => set({ query }),

  updateQueryRow: (index, patch) =>
    set((state) => ({
      query: state.query.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    })),

  addQueryRow: () =>
    set((state) => ({
      query: [...state.query, { key: "", value: "", enabled: true }],
    })),

  removeQueryRow: (index) =>
    set((state) => ({
      query:
        state.query.length <= 1
          ? [{ key: "", value: "", enabled: true }]
          : state.query.filter((_, i) => i !== index),
    })),

  setResponse: (response) => set({ response, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, response: null }),
}));
