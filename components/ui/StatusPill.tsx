import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "ok" | "low" | "out" | "info" | "warning" | "critical";
  label?: string;
}

const STATUS_CONFIG = {
  ok: { label: "OK", className: "bg-green-100 text-green-700" },
  low: { label: "Bas", className: "bg-yellow-100 text-yellow-700" },
  out: { label: "Épuisé", className: "bg-red-100 text-red-700" },
  info: { label: "Info", className: "bg-blue-100 text-blue-700" },
  warning: { label: "Attention", className: "bg-yellow-100 text-yellow-700" },
  critical: { label: "Critique", className: "bg-red-100 text-red-700" },
};

export function StatusPill({ status, label }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {label ?? config.label}
    </span>
  );
}
