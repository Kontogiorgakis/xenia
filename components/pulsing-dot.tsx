import { cn } from "@/lib/utils";

interface PulsingDotProps {
  className?: string;
  color?: string;
  size?: "sm" | "md";
}

/**
 * A small animated "live" indicator — a filled dot with an outward ping halo.
 * Pass tailwind color utilities via `color` (e.g. "bg-red-500", "bg-green-600").
 */
export function PulsingDot({
  className,
  color = "bg-red-500",
  size = "sm",
}: PulsingDotProps) {
  const sizeCls = size === "md" ? "size-2.5" : "size-2";
  return (
    <span className={cn("relative flex", sizeCls, className)}>
      <span
        className={cn(
          "absolute inline-flex size-full animate-ping rounded-full opacity-75",
          color
        )}
      />
      <span className={cn("relative inline-flex rounded-full", sizeCls, color)} />
    </span>
  );
}
