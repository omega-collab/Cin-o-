"use client";

import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/data/departments";

export function HistoryList() {
  const hydrated = useHydrated();
  const entries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  if (!hydrated) return <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Historique</h2>
          <p className="text-slate-500 text-sm">
            {entries.length} entrée{entries.length > 1 ? "s" : ""}
          </p>
        </div>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Effacer
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-400 text-sm">Aucune activité enregistrée</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const dept = DEPARTMENTS.find((d) => d.slug === entry.department);
            return (
              <Card key={entry.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{dept?.icon ?? "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900 text-sm">
                        {entry.action}
                      </p>
                      <span className="text-slate-400 text-xs shrink-0">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {entry.departmentName} · {entry.details}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
