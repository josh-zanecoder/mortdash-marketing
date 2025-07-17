// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}