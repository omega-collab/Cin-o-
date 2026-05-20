import { Bell } from "lucide-react";

interface AlertLine {
  dot: string;
  text: string;
}

const ALERTS: AlertLine[] = [
  { dot: "bg-orangeSoft", text: "Retard décor – 20 min" },
  { dot: "bg-blueSoft", text: "Circulation dense" },
];

export function AlertsCard() {
  return (
    <div className="glass-card rounded-app p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-muted" />
        <span className="text-sm text-textSoft font-medium">Alertes</span>
      </div>

      {/* Alert lines */}
      <div className="space-y-2.5">
        {ALERTS.map((alert, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 mt-1 ${alert.dot}`}
            />
            <p className="text-xs text-textSoft leading-snug">{alert.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
