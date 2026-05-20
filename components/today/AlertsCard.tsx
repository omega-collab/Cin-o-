import { TODAY_ALERTS } from "@/lib/data/schedule";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export function AlertsCard() {
  if (TODAY_ALERTS.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        🔔 Alertes
        <span className="bg-slate-100 text-slate-500 text-xs font-normal px-2 py-0.5 rounded-full">
          {TODAY_ALERTS.length}
        </span>
      </h4>
      <div className="space-y-2">
        {TODAY_ALERTS.map((alert) => (
          <div key={alert.id} className="flex items-start gap-2 text-sm">
            <StatusPill status={alert.severity} />
            <span className="text-slate-700 flex-1">{alert.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
