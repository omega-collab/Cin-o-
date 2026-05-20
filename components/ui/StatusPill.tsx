import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "ok" | "low" | "out" | "info" | "warning" | "critical";
  label?: string;
}

const STATUS_CONFIG: Record<
  StatusPillProps["status"],
  { label: string; style: React.CSSProperties }
> = {
  ok:       { label: "OK",       style: { background: "rgba(0,200,150,0.15)",  color: "#00C896" } },
  low:      { label: "Bas",      style: { background: "rgba(245,158,11,0.15)", color: "#F59E0B" } },
  out:      { label: "Épuisé",   style: { background: "rgba(239,68,68,0.15)",  color: "#EF4444" } },
  info:     { label: "Info",     style: { background: "rgba(59,130,246,0.15)", color: "#3B82F6" } },
  warning:  { label: "Attention",style: { background: "rgba(245,158,11,0.15)", color: "#F59E0B" } },
  critical: { label: "Critique", style: { background: "rgba(239,68,68,0.15)",  color: "#EF4444" } },
};

export function StatusPill({ status, label }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      )}
      style={config.style}
    >
      {label ?? config.label}
    </span>
  );
}
