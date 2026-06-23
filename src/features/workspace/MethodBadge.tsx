import type { HttpMethod } from "@/domain/models/request";
import { METHOD_BADGE_STYLES } from "@/domain/constants/http-methods";
import { cn } from "@/lib/utils";

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide",
        METHOD_BADGE_STYLES[method],
        className,
      )}
    >
      {method}
    </span>
  );
}
