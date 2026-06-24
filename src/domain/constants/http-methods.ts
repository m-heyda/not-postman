import type { HttpMethod } from "@/domain/models/request";

export const METHOD_BADGE_STYLES: Record<HttpMethod, string> = {
  GET: "text-emerald-700 bg-emerald-50/50 border-emerald-200/60",
  POST: "text-amber-700 bg-amber-50/50 border-amber-200/60",
  PUT: "text-blue-600 bg-blue-50/50 border-blue-200/60",
  PATCH: "text-violet-600 bg-violet-50/50 border-violet-200/60",
  DELETE: "text-rose-600 bg-rose-50/50 border-rose-200/60",
  HEAD: "text-zinc-500 bg-zinc-50/50 border-zinc-200/60",
  OPTIONS: "text-zinc-500 bg-zinc-50/50 border-zinc-200/60",
};

export const METHOD_TEXT_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-700",
  POST: "text-amber-700",
  PUT: "text-blue-600",
  PATCH: "text-violet-600",
  DELETE: "text-rose-600",
  HEAD: "text-zinc-500",
  OPTIONS: "text-zinc-500",
};
