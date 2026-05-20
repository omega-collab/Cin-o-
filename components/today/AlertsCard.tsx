import { TODAY_ALERTS } from "@/lib/data/schedule";
import type { AlertItem } from "@/lib/types";

export function AlertsCard() {
  if (TODAY_ALERTS.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#1C1D2B", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-white">Alertes</h4>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)", color: "#8B8CA8" }}
        >
          {TODAY_ALERTS.length}
        </span>
      </div>

      {/* Alert list */}
      <div className="space-y-2.5">
        {TODAY_ALERTS.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const dotColor =
    alert.severity === "critical"
      ? "#EF4444"
      : alert.severity === "warning"
      ? "#F97316"
      : "#60A5FA";

  const iconLabel =
    alert.severity === "critical"
      ? "▲"
      : alert.severity === "warning"
      ? "▲"
      : "ℹ";

  return (
    <div className="flex items-start gap-2.5">
      {/* Severity dot */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        <span
          className="text-[11px] font-bold leading-none"
          style={{ color: dotColor }}
        >
          {iconLabel}
        </span>
      </div>

      {/* Message */}
      <p
        className="text-[13px] leading-snug flex-1"
        style={{ color: "#C4C5D6" }}
      >
        {alert.message}
      </p>
    </div>
  );
}
