import { Cloud } from "lucide-react";

export function CanteenCard() {
  return (
    <div className="glass-card rounded-app p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="w-4 h-4 text-muted" />
        <span className="text-sm text-textSoft font-medium">Météo</span>
      </div>

      {/* Temperature */}
      <p className="text-3xl font-bold text-white leading-none">18°</p>

      {/* Condition */}
      <p className="text-xs text-muted mt-1.5 leading-snug">
        Couvert · Vent 14 km/h
      </p>
    </div>
  );
}
