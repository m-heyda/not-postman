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

export type EditedSection =
  | "docs"
  | "params"
  | "path"
  | "headers"
  | "body"
  | "method"
  | "url";

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

function defaultDocsPath(sourcePath: string): string {
  const basename = sourcePath.replace(/\.yaml$/, "").split("/").pop() ?? "docs";
  return `${basename}.md`;
}

interface RequestDraftState {
  name: string;
  sourcePath: string | null;
  requestId: string | null;
  method: HttpMethod;
  url: string;
  baseUrlVar: string;
  urlPath: string;
  docsPath: string | null;
  headers: KeyValuePair[];
  query: KeyValuePair[];
  path: KeyValuePair[];
  bodyType: Request["body"]["type"];
  bodyContent: string;
  docsContent: string;
  savedDocsContent: string;
  response: ExecuteResponse | null;
  isLoading: boolean;
  error: string | null;
  generated: Request["generated"] | null;
  generatedContent: string | null;
  sourceResponseContent: string | null;

  savedRevision: number;
  dirtyRevision: number;
  lastEditedSection: EditedSection | null;

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
  setDocsFromDisk: (content: string, legacyDescription?: string) => void;

  setResponse: (response: ExecuteResponse | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setGeneratedContent: (content: string | null) => void;
  setSourceResponseContent: (content: string | null) => void;
  setGenerated: (generated: Request["generated"] | null) => void;

  draftToRequest: () => Request | null;
  resolveDocsPath: () => string | null;
  isDocsDirty: () => boolean;
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
  docsPath: null as string | null,
  headers: [{ key: "", value: "", enabled: true }] as KeyValuePair[],
  query: [{ key: "", value: "", enabled: true }] as KeyValuePair[],
  path: [] as KeyValuePair[],
  bodyType: "none" as Request["body"]["type"],
  bodyContent: "",
  docsContent: "",
  savedDocsContent: "",
  response: null as ExecuteResponse | null,
  isLoading: false,
  error: null as string | null,
  generated: null as Request["generated"] | null,
  generatedContent: null as string | null,
  sourceResponseContent: null as string | null,
  savedRevision: 0,
  dirtyRevision: 0,
  lastEditedSection: null as EditedSection | null,
};

function bumpDirty(
  state: typeof INITIAL_STATE,
  section: EditedSection,
) {
  return {
    dirtyRevision: state.dirtyRevision + 1,
    lastEditedSection: section,
  };
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
      set((s) => ({ query, ...bumpDirty(s, "params") }));
      const sp = get().sourcePath;
      query.forEach((r) => {
        if (r.locked) persistLockedValue(r, sp, "query");
      });
    },
  );

  const pathActions: KeyValueActions = createKeyValueActions(
    () => get().path,
    (path) => {
      set((s) => ({ path, ...bumpDirty(s, "path") }));
      const sp = get().sourcePath;
      path.forEach((r) => {
        if (r.locked) persistLockedValue(r, sp, "path");
      });
    },
  );

  const headerActions: KeyValueActions = createKeyValueActions(
    () => get().headers,
    (headers) => {
      set((s) => ({ headers, ...bumpDirty(s, "headers") }));
      const sp = get().sourcePath;
      headers.forEach((r) => {
        if (r.locked) persistLockedValue(r, sp, "headers");
      });
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
        docsPath: request.docs ?? null,
        headers,
        query,
        path: pathParams,
        bodyType: request.body.type,
        bodyContent: request.body.content ?? "",
        docsContent: "",
        savedDocsContent: "",
        response: null,
        error: null,
        generated: request.generated ?? null,
        generatedContent: request.generatedContent ?? null,
        sourceResponseContent: request.sourceResponseContent ?? null,
        savedRevision: rev,
        dirtyRevision: rev,
        lastEditedSection: null,
      });
    },

    reset: () => set(INITIAL_STATE),

    setMethod: (method) =>
      set((s) => ({ method, ...bumpDirty(s, "method") })),

    setUrl: (url) => {
      const { baseUrlVar, urlPath } = splitUrl(url);
      set((s) => ({ url, baseUrlVar, urlPath, ...bumpDirty(s, "url") }));
    },

    setBaseUrlVar: (baseUrlVar) =>
      set((state) => ({
        baseUrlVar,
        url: buildUrl(baseUrlVar, state.urlPath),
        ...bumpDirty(state, "url"),
      })),

    setUrlPath: (urlPath) =>
      set((state) => ({
        urlPath,
        url: buildUrl(state.baseUrlVar, urlPath),
        ...bumpDirty(state, "url"),
      })),

    setQuery: (query) => set((s) => ({ query, ...bumpDirty(s, "params") })),
    updateQueryRow: queryActions.update,
    addQueryRow: queryActions.add,
    removeQueryRow: queryActions.remove,

    setPath: (path) => set((s) => ({ path, ...bumpDirty(s, "path") })),
    updatePathRow: pathActions.update,
    addPathRow: pathActions.add,
    removePathRow: pathActions.remove,

    setHeaders: (headers) =>
      set((s) => ({ headers, ...bumpDirty(s, "headers") })),
    updateHeaderRow: headerActions.update,
    addHeaderRow: headerActions.add,
    removeHeaderRow: headerActions.remove,

    setBodyType: (type) =>
      set((s) => ({ bodyType: type, ...bumpDirty(s, "body") })),
    setBodyContent: (content) =>
      set((s) => ({ bodyContent: content, ...bumpDirty(s, "body") })),

    setDocsContent: (content) =>
      set((s) => ({ docsContent: content, ...bumpDirty(s, "docs") })),

    setDocsFromDisk: (content, legacyDescription) => {
      let merged = content;
      const desc = legacyDescription?.trim();
      if (desc && !merged.includes(desc)) {
        merged = merged.trim() ? `${desc}\n\n${merged}` : desc;
      }
      set({ docsContent: merged, savedDocsContent: merged });
    },

    setResponse: (response) => set({ response, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, response: null }),
    setGeneratedContent: (content) => set({ generatedContent: content }),
    setSourceResponseContent: (content) =>
      set({ sourceResponseContent: content }),
    setGenerated: (generated) => set({ generated }),

    markSaved: () =>
      set((s) => {
        const docsPath =
          s.docsPath ??
          (s.docsContent.trim() && s.sourcePath
            ? defaultDocsPath(s.sourcePath)
            : null);
        return {
          savedRevision: s.dirtyRevision,
          savedDocsContent: s.docsContent,
          docsPath,
        };
      }),

    isDirty: () => {
      const s = get();
      return s.dirtyRevision !== s.savedRevision;
    },

    isDocsDirty: () => {
      const s = get();
      return s.docsContent !== s.savedDocsContent;
    },

    resolveDocsPath: () => {
      const s = get();
      if (!s.sourcePath) return null;
      if (s.docsPath) return s.docsPath;
      if (s.docsContent.trim()) return defaultDocsPath(s.sourcePath);
      return null;
    },

    draftToRequest: () => {
      const s = get();
      if (!s.requestId) return null;

      const stripEmpty = (rows: KeyValuePair[]) =>
        rows.filter((r) => r.key.trim() !== "");

      const stripLockedValues = (rows: KeyValuePair[]): KeyValuePair[] =>
        rows.map((r) => (r.locked ? { ...r, value: "" } : r));

      const docsPointer = s.resolveDocsPath();

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
        ...(docsPointer ? { docs: docsPointer } : {}),
        ...(s.generated ? { generated: s.generated } : {}),
      };
    },
  };
});
