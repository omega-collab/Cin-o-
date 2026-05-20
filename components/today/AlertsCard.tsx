"use client";

import { Bell, AlertTriangle, Info } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { MOCK_SHOOT } from "@/lib/data/mockShoot";

const SEVERITY_ICON = {
  info: <Info className="w-3.5 h-3.5 text-blueSoft shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-orangeSoft shrink-0 mt-0.5" />,
  critical: <AlertTriangle className="w-3.5 h-3.5 text-redSoft shrink-0 mt-0.5" />,
};

export function AlertsCard() {
  const shoot = useShootStore((s) => s.shoot);

  const isLive = shoot.isPublished && shoot.alerts.length > 0;
  const alerts = isLive ? shoot.alerts : MOCK_SHOOT.alerts;

  if (alerts.length === 0) return null;

  return (
    <div className="glass-card rounded-app p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-muted" />
        <span className="text-sm font-semibold text-white">Alertes</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-muted">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-2">
            {SEVERITY_ICON[alert.severity]}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-textSoft leading-snug">{alert.message}</p>
              {alert.department && (
                <p className="text-[10px] text-muted mt-0.5">{alert.department}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
