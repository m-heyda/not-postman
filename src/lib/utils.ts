import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tryFormatJson(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-600";
  if (status >= 300 && status < 400) return "text-amber-600";
  if (status >= 400) return "text-red-600";
  return "text-muted-foreground";
}
