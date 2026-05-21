import type { WorkDay, ComputedDay, ConventionType } from "@/lib/types/intermittent";

// Convert "HH:MM" to minutes since midnight
export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

// Format minutes → "Xh YYmin" or "Xh"
export function fmtMinutes(min: number): string {
  if (min <= 0) return "0h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, "0")}`;
}

// Minutes of early hours (before 7h) within a time range
function minutesBefore7(startMin: number, endMin: number): number {
  const before7 = 7 * 60;
  if (endMin <= before7) return Math.max(0, endMin - startMin);
  if (startMin >= before7) return 0;
  return before7 - startMin;
}

// Minutes of night hours (after 22h) within a time range
function minutesAfter22(startMin: number, endMin: number): number {
  const after22 = 22 * 60;
  if (startMin >= after22) return Math.max(0, endMin - startMin);
  if (endMin <= after22) return 0;
  return endMin - after22;
}

export function computeDay(day: WorkDay): ComputedDay {
  const start = toMinutes(day.startTime);
  const end = toMinutes(day.endTime);

  if (end <= start) {
    return {
      effectiveMinutes: 0,
      heuresNormales: 0,
      heuresSup: 0,
      heuresAnticipees: 0,
      heuresDeNuit: 0,
      lunchMinutes: 0,
      isJourneeContinue: false,
      coefficient: 1,
    };
  }

  // Lunch pause
  let lunchMinutes = 0;
  if (day.lunchStart && day.lunchEnd) {
    const ls = toMinutes(day.lunchStart);
    const le = toMinutes(day.lunchEnd);
    lunchMinutes = Math.max(0, le - ls);
  }
  const isJourneeContinue = lunchMinutes < 30;

  // Effective work time
  const effectiveMinutes = Math.max(0, end - start - lunchMinutes);

  // 8h = 480 minutes standard
  const heuresNormalesMin = Math.min(effectiveMinutes, 480);
  const heuresSupMin = Math.max(0, effectiveMinutes - 480);

  // Anticipées and nuit based on presence window (not effective, per convention)
  const heuresAnticipeesMin = minutesBefore7(start, end);
  const heuresDeNuitMin = minutesAfter22(start, end);

  // Global coefficient (simplified for display)
  const hasNuit = heuresDeNuitMin > 0;
  const hasContinue = isJourneeContinue;
  const hasAnticipee = heuresAnticipeesMin > 0;
  let coefficient = 1.0;
  if (hasContinue) coefficient += 0.15;
  // night coefficient depends on convention
  if (hasNuit) {
    coefficient += day.convention === "audiovisuel" ? 0.50 : 0.25;
  }
  if (hasAnticipee && !hasNuit) coefficient += 0.25;

  return {
    effectiveMinutes,
    heuresNormales: heuresNormalesMin / 60,
    heuresSup: heuresSupMin / 60,
    heuresAnticipees: heuresAnticipeesMin / 60,
    heuresDeNuit: heuresDeNuitMin / 60,
    lunchMinutes,
    isJourneeContinue,
    coefficient: Math.round(coefficient * 100) / 100,
  };
}

// Salary estimate (brut) for a day
export function estimateSalary(
  computed: ComputedDay,
  tauxHoraire: number,
  convention: ConventionType
): number {
  const base = computed.heuresNormales * tauxHoraire;
  const sup = computed.heuresSup * tauxHoraire * 1.25;
  const nuitCoeff = convention === "audiovisuel" ? 1.5 : 1.25;
  const nuit = computed.heuresDeNuit * tauxHoraire * nuitCoeff;
  const anticipee = computed.heuresAnticipees * tauxHoraire * 1.25;
  const continueBonus = computed.isJourneeContinue ? base * 0.15 : 0;
  return Math.round((base + sup + nuit + anticipee + continueBonus) * 100) / 100;
}

// ISO week number
export function isoWeek(date: Date): number {
  const d = new Date(date.valueOf());
  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);
  const firstThursday = d.valueOf();
  d.setMonth(0, 1);
  if (d.getDay() !== 4) {
    d.setMonth(0, 1 + ((4 - d.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - d.valueOf()) / 604800000);
}

export function frDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
