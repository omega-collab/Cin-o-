import { formatDate } from "@/lib/utils";
import { TODAY_ALERTS } from "@/lib/data/schedule";

export function Hero() {
  const today = formatDate(new Date().toISOString());
  const criticalCount = TODAY_ALERTS.filter((a) => a.severity === "critical").length;
  const warningCount = TODAY_ALERTS.filter((a) => a.severity === "warning").length;

  return (
    <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-purple-300 text-sm font-medium uppercase tracking-wider">
            Feuille de service
          </p>
          <h2 className="text-2xl font-bold mt-1 capitalize">{today}</h2>
          <p className="text-purple-200 mt-2 text-sm">
            Tournage en cours · Paris
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold">
            {new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="mt-4 flex gap-2">
          {criticalCount > 0 && (
            <span className="bg-red-500/30 text-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
              🔴 {criticalCount} critique{criticalCount > 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className="bg-yellow-500/30 text-yellow-200 text-xs font-medium px-2.5 py-1 rounded-full">
              ⚠️ {warningCount} attention{warningCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
