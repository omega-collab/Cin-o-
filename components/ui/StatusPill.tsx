interface StatusPillProps {
  status:
    | "ok"
    | "low"
    | "out"
    | "info"
    | "warning"
    | "critical"
    | "analyzed"
    | "pending"
    | "error";
  label?: string;
}

const STATUS_CONFIG = {
  ok:       { label: "OK",         bg: "rgba(74,222,128,0.12)",  text: "#4ADE80" },
  analyzed: { label: "Analysé",    bg: "rgba(74,222,128,0.12)",  text: "#4ADE80" },
  low:      { label: "Bas",        bg: "rgba(255,176,32,0.12)",   text: "#FFB020" },
  warning:  { label: "Attention",  bg: "rgba(255,176,32,0.12)",   text: "#FFB020" },
  pending:  { label: "En attente", bg: "rgba(45,140,255,0.12)",   text: "#2D8CFF" },
  info:     { label: "Info",       bg: "rgba(45,140,255,0.12)",   text: "#2D8CFF" },
  out:      { label: "Rupture",    bg: "rgba(255,77,77,0.12)",    text: "#FF4D4D" },
  critical: { label: "Critique",   bg: "rgba(255,77,77,0.12)",    text: "#FF4D4D" },
  error:    { label: "Erreur",     bg: "rgba(255,77,77,0.12)",    text: "#FF4D4D" },
} as const;

export function StatusPill({ status, label }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold"
      style={{ background: config.bg, color: config.text }}
    >
      {label ?? config.label}
    </span>
  );
}
