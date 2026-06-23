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
import {
  getLocalValue,
  setLocalValue,
  removeLocalValue,
} from "@/lib/storage/local-values";

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
  requestId: string | null;
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
  generated: Request["generated"] | null;
  generatedContent: string | null;

  savedRevision: number;
  dirtyRevision: number;

  loadFromRequest: (request: Request, sourcePath: string) => void;
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
  setGeneratedContent: (content: string | null) => void;
  setGenerated: (generated: Request["generated"] | null) => void;

  draftToRequest: () => Request | null;
  markSaved: () => void;
  isDirty: () => boolean;
}

const INITIAL_STATE = {
  name: "",
  sourcePath: null as string | null,
  requestId: null as string | null,
  method: "GET" as HttpMethod,
  url: "",
  baseUrlVar: "",
  urlPath: "",
  headers: [{ key: "", value: "", enabled: true }] as KeyValuePair[],
  query: [{ key: "", value: "", enabled: true }] as KeyValuePair[],
  path: [] as KeyValuePair[],
  bodyType: "none" as Request["body"]["type"],
  bodyContent: "",
  docsContent: "",
  response: null as ExecuteResponse | null,
  isLoading: false,
  error: null as string | null,
  generated: null as Request["generated"] | null,
  generatedContent: null as string | null,
  savedRevision: 0,
  dirtyRevision: 0,
};

function bumpDirty(state: typeof INITIAL_STATE) {
  return { dirtyRevision: state.dirtyRevision + 1 };
}

function hydrateLockedValues(
  rows: KeyValuePair[],
  sourcePath: string,
  section: string,
): KeyValuePair[] {
  return rows.map((row) => {
    if (!row.locked || !row.key) return row;
    const stored = getLocalValue(sourcePath, section, row.key);
    return stored !== null ? { ...row, value: stored } : row;
  });
}

function persistLockedValue(
  row: KeyValuePair,
  sourcePath: string | null,
  section: string,
): void {
  if (!sourcePath || !row.key) return;
  if (row.locked) {
    setLocalValue(sourcePath, section, row.key, row.value);
  } else {
    removeLocalValue(sourcePath, section, row.key);
  }
}

export const useRequestStore = create<RequestDraftState>((set, get) => {
  const queryActions: KeyValueActions = createKeyValueActions(
    () => get().query,
    (query) => {
      set((s) => ({ query, ...bumpDirty(s) }));
      // Persist locked values immediately
      const sp = get().sourcePath;
      query.forEach((r) => { if (r.locked) persistLockedValue(r, sp, "query"); });
    },
  );

  const pathActions: KeyValueActions = createKeyValueActions(
    () => get().path,
    (path) => {
      set((s) => ({ path, ...bumpDirty(s) }));
      const sp = get().sourcePath;
      path.forEach((r) => { if (r.locked) persistLockedValue(r, sp, "path"); });
    },
  );

  const headerActions: KeyValueActions = createKeyValueActions(
    () => get().headers,
    (headers) => {
      set((s) => ({ headers, ...bumpDirty(s) }));
      const sp = get().sourcePath;
      headers.forEach((r) => { if (r.locked) persistLockedValue(r, sp, "headers"); });
    },
  );

  return {
    ...INITIAL_STATE,

    loadFromRequest: (request, sourcePath) => {
      const { baseUrlVar, urlPath } = splitUrl(request.url);
      const rev = get().savedRevision + 1;

      const headers = request.headers.length
        ? hydrateLockedValues(request.headers, sourcePath, "headers")
        : [{ key: "", value: "", enabled: true }];
      const query = request.query.length
        ? hydrateLockedValues(request.query, sourcePath, "query")
        : [{ key: "", value: "", enabled: true }];
      const pathParams = request.path?.length
        ? hydrateLockedValues(request.path, sourcePath, "path")
        : [];

      set({
        name: request.name,
        sourcePath,
        requestId: request.id,
        method: request.method,
        url: request.url,
        baseUrlVar,
        urlPath,
        headers,
        query,
        path: pathParams,
        bodyType: request.body.type,
        bodyContent: request.body.content ?? "",
        docsContent: "",
        response: null,
        error: null,
        generated: request.generated ?? null,
        generatedContent: request.generatedContent ?? null,
        savedRevision: rev,
        dirtyRevision: rev,
      });
    },

    reset: () => set(INITIAL_STATE),

    setMethod: (method) => set((s) => ({ method, ...bumpDirty(s) })),

    setUrl: (url) => {
      const { baseUrlVar, urlPath } = splitUrl(url);
      set((s) => ({ url, baseUrlVar, urlPath, ...bumpDirty(s) }));
    },

    setBaseUrlVar: (baseUrlVar) =>
      set((state) => ({
        baseUrlVar,
        url: buildUrl(baseUrlVar, state.urlPath),
        ...bumpDirty(state),
      })),

    setUrlPath: (urlPath) =>
      set((state) => ({
        urlPath,
        url: buildUrl(state.baseUrlVar, urlPath),
        ...bumpDirty(state),
      })),

    setQuery: (query) => set((s) => ({ query, ...bumpDirty(s) })),
    updateQueryRow: queryActions.update,
    addQueryRow: queryActions.add,
    removeQueryRow: queryActions.remove,

    setPath: (path) => set((s) => ({ path, ...bumpDirty(s) })),
    updatePathRow: pathActions.update,
    addPathRow: pathActions.add,
    removePathRow: pathActions.remove,

    setHeaders: (headers) => set((s) => ({ headers, ...bumpDirty(s) })),
    updateHeaderRow: headerActions.update,
    addHeaderRow: headerActions.add,
    removeHeaderRow: headerActions.remove,

    setBodyType: (type) => set((s) => ({ bodyType: type, ...bumpDirty(s) })),
    setBodyContent: (content) =>
      set((s) => ({ bodyContent: content, ...bumpDirty(s) })),
    setDocsContent: (content) => set({ docsContent: content }),

    setResponse: (response) => set({ response, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, response: null }),
    setGeneratedContent: (content) => set({ generatedContent: content }),
    setGenerated: (generated) => set({ generated }),

    markSaved: () => set((s) => ({ savedRevision: s.dirtyRevision })),

    isDirty: () => {
      const s = get();
      return s.dirtyRevision !== s.savedRevision;
    },

    draftToRequest: () => {
      const s = get();
      if (!s.requestId) return null;

      const stripEmpty = (rows: KeyValuePair[]) =>
        rows.filter((r) => r.key.trim() !== "");

      const stripLockedValues = (rows: KeyValuePair[]): KeyValuePair[] =>
        rows.map((r) =>
          r.locked ? { ...r, value: "" } : r,
        );

      return {
        version: 1,
        kind: "request",
        id: s.requestId,
        name: s.name,
        method: s.method,
        url: buildUrl(s.baseUrlVar, s.urlPath),
        headers: stripLockedValues(stripEmpty(s.headers)),
        query: stripLockedValues(stripEmpty(s.query)),
        path: stripLockedValues(stripEmpty(s.path)),
        body: {
          type: s.bodyType,
          ...(s.bodyContent ? { content: s.bodyContent } : {}),
        },
        ...(s.generated ? { generated: s.generated } : {}),
      };
    },
  };
});
