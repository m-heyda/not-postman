import type { HttpMethod } from "@/domain/models/request";

export const METHOD_BADGE_STYLES: Record<HttpMethod, string> = {
  GET: "text-emerald-600 bg-emerald-50 border-emerald-200",
  POST: "text-amber-600 bg-amber-50 border-amber-200",
  PUT: "text-blue-600 bg-blue-50 border-blue-200",
  PATCH: "text-purple-600 bg-purple-50 border-purple-200",
  DELETE: "text-red-600 bg-red-50 border-red-200",
  HEAD: "text-slate-600 bg-slate-50 border-slate-200",
  OPTIONS: "text-slate-600 bg-slate-50 border-slate-200",
};

export const METHOD_TEXT_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-600",
  POST: "text-amber-600",
  PUT: "text-blue-600",
  PATCH: "text-purple-600",
  DELETE: "text-red-600",
  HEAD: "text-slate-600",
  OPTIONS: "text-slate-600",
};
