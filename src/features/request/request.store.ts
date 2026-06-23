import { create } from "zustand";
import type {
  ExecuteResponse,
  HttpMethod,
  KeyValuePair,
  Request,
} from "@/domain/models/request";

interface RequestDraftState {
  name: string;
  method: HttpMethod;
  url: string;
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
  setQuery: (query: KeyValuePair[]) => void;
  updateQueryRow: (index: number, patch: Partial<KeyValuePair>) => void;
  addQueryRow: () => void;
  removeQueryRow: (index: number) => void;
  setResponse: (response: ExecuteResponse | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRequestStore = create<RequestDraftState>((set) => ({
  name: "",
  method: "GET",
  url: "",
  headers: [],
  query: [],
  bodyType: "none",
  bodyContent: "",
  response: null,
  isLoading: false,
  error: null,

  loadFromRequest: (request) =>
    set({
      name: request.name,
      method: request.method,
      url: request.url,
      headers: request.headers,
      query: request.query.length ? request.query : [{ key: "", value: "", enabled: true }],
      bodyType: request.body.type,
      bodyContent: request.body.content ?? "",
      response: null,
      error: null,
    }),

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
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
