import { create } from "zustand";
import type {
  ExecuteResponse,
  HttpMethod,
  KeyValuePair,
  Request,
} from "@/domain/models/request";
import {
  createKeyValueActions,
  type KeyValueActions,
} from "@/lib/store/key-value-actions";

const VAR_PATTERN = /^\{\{(\w+)\}\}(.*)/;

function splitUrl(url: string): { baseUrlVar: string; urlPath: string } {
  const match = url.match(VAR_PATTERN);
  if (match) {
    return { baseUrlVar: match[1]!, urlPath: match[2] ?? "" };
  }
  return { baseUrlVar: "", urlPath: url };
}

function buildUrl(baseUrlVar: string, urlPath: string): string {
  if (baseUrlVar) return `{{${baseUrlVar}}}${urlPath}`;
  return urlPath;
}

interface RequestDraftState {
  name: string;
  sourcePath: string | null;
  method: HttpMethod;
  url: string;
  baseUrlVar: string;
  urlPath: string;
  headers: KeyValuePair[];
  query: KeyValuePair[];
  path: KeyValuePair[];
  bodyType: Request["body"]["type"];
  bodyContent: string;
  docsContent: string;
  response: ExecuteResponse | null;
  isLoading: boolean;
  error: string | null;

  loadFromRequest: (request: Request) => void;
  reset: () => void;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBaseUrlVar: (baseUrlVar: string) => void;
  setUrlPath: (urlPath: string) => void;

  setQuery: (query: KeyValuePair[]) => void;
  updateQueryRow: (index: number, patch: Partial<KeyValuePair>) => void;
  addQueryRow: () => void;
  removeQueryRow: (index: number) => void;

  setPath: (path: KeyValuePair[]) => void;
  updatePathRow: (index: number, patch: Partial<KeyValuePair>) => void;
  addPathRow: () => void;
  removePathRow: (index: number) => void;

  setHeaders: (headers: KeyValuePair[]) => void;
  updateHeaderRow: (index: number, patch: Partial<KeyValuePair>) => void;
  addHeaderRow: () => void;
  removeHeaderRow: (index: number) => void;

  setBodyType: (type: Request["body"]["type"]) => void;
  setBodyContent: (content: string) => void;
  setDocsContent: (content: string) => void;

  setResponse: (response: ExecuteResponse | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const INITIAL_STATE = {
  name: "",
  sourcePath: null as string | null,
  method: "GET" as HttpMethod,
  url: "",
  baseUrlVar: "",
  urlPath: "",
  headers: [{ key: "", value: "", enabled: true }],
  query: [{ key: "", value: "", enabled: true }],
  path: [] as KeyValuePair[],
  bodyType: "none" as Request["body"]["type"],
  bodyContent: "",
  docsContent: "",
  response: null as ExecuteResponse | null,
  isLoading: false,
  error: null as string | null,
};

export const useRequestStore = create<RequestDraftState>((set, get) => {
  const queryActions: KeyValueActions = createKeyValueActions(
    () => get().query,
    (query) => set({ query }),
  );

  const pathActions: KeyValueActions = createKeyValueActions(
    () => get().path,
    (path) => set({ path }),
  );

  const headerActions: KeyValueActions = createKeyValueActions(
    () => get().headers,
    (headers) => set({ headers }),
  );

  return {
    ...INITIAL_STATE,

    loadFromRequest: (request) => {
      const { baseUrlVar, urlPath } = splitUrl(request.url);
      set({
        name: request.name,
        sourcePath: request.id,
        method: request.method,
        url: request.url,
        baseUrlVar,
        urlPath,
        headers: request.headers.length
          ? request.headers
          : [{ key: "", value: "", enabled: true }],
        query: request.query.length
          ? request.query
          : [{ key: "", value: "", enabled: true }],
        path: request.path ?? [],
        bodyType: request.body.type,
        bodyContent: request.body.content ?? "",
        docsContent: "",
        response: null,
        error: null,
      });
    },

    reset: () => set(INITIAL_STATE),

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
    updateQueryRow: queryActions.update,
    addQueryRow: queryActions.add,
    removeQueryRow: queryActions.remove,

    setPath: (path) => set({ path }),
    updatePathRow: pathActions.update,
    addPathRow: pathActions.add,
    removePathRow: pathActions.remove,

    setHeaders: (headers) => set({ headers }),
    updateHeaderRow: headerActions.update,
    addHeaderRow: headerActions.add,
    removeHeaderRow: headerActions.remove,

    setBodyType: (type) => set({ bodyType: type }),
    setBodyContent: (content) => set({ bodyContent: content }),
    setDocsContent: (content) => set({ docsContent: content }),

    setResponse: (response) => set({ response, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, response: null }),
  };
});
