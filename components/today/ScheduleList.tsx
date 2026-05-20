import { TODAY_SCHEDULE } from "@/lib/data/schedule";
import { Card } from "@/components/ui/Card";

export function ScheduleList() {
  const morning = TODAY_SCHEDULE.filter((s) => s.period === "morning");
  const afternoon = TODAY_SCHEDULE.filter((s) => s.period === "afternoon");

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 text-lg">Programme du jour</h3>
      {morning.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ☀️ Matin
          </p>
          {morning.map((seq) => (
            <SequenceCard key={seq.id} sequence={seq} />
          ))}
        </div>
      )}
      {afternoon.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            🌤️ Après-midi
          </p>
          {afternoon.map((seq) => (
            <SequenceCard key={seq.id} sequence={seq} />
          ))}
        </div>
      )}
    </div>
  );
}

function SequenceCard({ sequence }: { sequence: (typeof TODAY_SCHEDULE)[number] }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="bg-purple-100 text-purple-700 font-mono text-sm font-bold px-2.5 py-1 rounded-lg shrink-0">
          {sequence.time}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm">{sequence.description}</p>
          <p className="text-slate-500 text-xs mt-0.5">📍 {sequence.location}</p>
          {sequence.cast.length > 0 && (
            <p className="text-slate-500 text-xs mt-1">
              🎭 {sequence.cast.join(", ")}
            </p>
          )}
          {sequence.notes && (
            <p className="text-amber-600 text-xs mt-1 italic">💡 {sequence.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
