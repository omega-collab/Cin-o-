"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin, SlidersHorizontal } from "lucide-react";
import { PRODUCTION_DAYS } from "@/lib/data/calendar";
import type { ProductionDay } from "@/lib/data/calendar";

// ── helpers ───────────────────────────────────────────────────────────────────

const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface WeekDay {
  dayLabel: string;
  dayNum: number;
  date: string;
  hasEvent: boolean;
}

function getWeekDays(base: Date, offset: number): WeekDay[] {
  const dow = base.getDay();
  const mondayDelta = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayDelta + offset * 7);
  const eventDates = new Set(PRODUCTION_DAYS.map((d) => d.date));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = toISODate(d);
    const idx = (d.getDay() + 6) % 7;
    return {
      dayLabel: DAY_LABELS[idx] ?? "LUN",
      dayNum: d.getDate(),
      date: iso,
      hasEvent: eventDates.has(iso),
    };
  });
}

function frMonthYear(date: Date, offset: number): string {
  const d = new Date(date);
  const dow = d.getDay();
  const mondayDelta = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + mondayDelta + offset * 7 + 3); // mid-week
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function frDayMonth(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

// ── status helpers ────────────────────────────────────────────────────────────

type Status = ProductionDay["status"];
type Period = ProductionDay["period"];

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string; border: string }> = {
  confirmed: { label: "Confirmé",  bg: "bg-cyanSoft",         color: "text-cyan",       border: "#00E0D0" },
  pending:   { label: "À vérifier", bg: "bg-orangeSoft/10",   color: "text-orangeSoft", border: "#FFB020" },
  cancelled: { label: "Annulé",    bg: "bg-redSoft/10",        color: "text-redSoft",    border: "#FF4D4D" },
};

const PERIOD_CONFIG: Record<Period, { label: string; bg: string; color: string }> = {
  day:   { label: "JOUR", bg: "bg-blueSoft/10",   color: "text-blueSoft"   },
  night: { label: "NUIT", bg: "bg-violetSoft/10", color: "text-violetSoft" },
};

// ── sub-components ────────────────────────────────────────────────────────────

function DayColumn({
  day, isSelected, isToday, onClick,
}: {
  day: WeekDay; isSelected: boolean; isToday: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-1 py-2 relative"
      style={{ minWidth: 0 }}
      aria-pressed={isSelected}
    >
      <span className={`text-[10px] font-semibold tracking-widest uppercase ${isSelected ? "text-cyan" : "text-muted"}`}>
        {day.dayLabel}
      </span>
      <span
        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors
          ${isSelected ? "bg-cyan text-appBg" : isToday ? "bg-cyanSoft text-cyan" : "text-textSoft"}`}
      >
        {day.dayNum}
      </span>
      {day.hasEvent && (
        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? "bg-appBg" : "bg-cyan"}`} />
      )}
    </button>
  );
}

function ProductionDayCard({ day }: { day: ProductionDay }) {
  const s = STATUS_CONFIG[day.status];
  const p = PERIOD_CONFIG[day.period];
  return (
    <div
      className="glass-card rounded-app overflow-hidden"
      style={{ borderLeft: `3px solid ${s.border}` }}
    >
      <div className="p-4 space-y-3">
        {/* Row 1: label + date + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-cyan">{day.label}</span>
          <span className="text-sm font-semibold text-white capitalize flex-1 truncate">
            {frDayMonth(day.date)}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>
            {s.label}
          </span>
        </div>

        {/* Row 2: location */}
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-muted shrink-0" />
          <span className="text-xs text-muted truncate">{day.location}</span>
        </div>

        {/* Row 3: scenes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {day.scenes.map((scene) => (
            <span key={scene} className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted">
              {scene}
            </span>
          ))}
        </div>

        {/* Row 4: times + period badge */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-mono font-semibold text-textSoft">
            {day.startTime} — {day.endTime}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide ${p.bg} ${p.color}`}>
            {p.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function CalendarView() {
  const today = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const weekDays = useMemo(() => getWeekDays(new Date(), weekOffset), [weekOffset]);
  const monthYear = useMemo(() => frMonthYear(new Date(), weekOffset), [weekOffset]);

  const upcomingDays = useMemo(
    () => PRODUCTION_DAYS.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [today]
  );

  return (
    <div className="space-y-5">
      {/* Filter row */}
      <div className="grid grid-cols-3 gap-2">
        <button className="glass-card rounded-2xl px-3 py-2.5 text-xs text-muted text-left">
          Département
        </button>
        <button className="glass-card rounded-2xl px-3 py-2.5 text-xs text-muted text-left">
          Jours prod.
        </button>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="glass-card rounded-2xl px-3 py-2.5 text-xs flex items-center justify-center gap-1.5 text-textSoft"
        >
          <SlidersHorizontal size={13} />
          Filtres
        </button>
      </div>

      {/* Week strip */}
      <div className="glass-card rounded-app p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl glass-card text-textSoft"
            aria-label="Semaine précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-textSoft capitalize">{monthYear}</span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl glass-card text-textSoft"
            aria-label="Semaine suivante"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex">
          {weekDays.map((day) => (
            <DayColumn
              key={day.date}
              day={day}
              isSelected={day.date === selectedDate}
              isToday={day.date === today}
              onClick={() => setSelectedDate(day.date)}
            />
          ))}
        </div>
      </div>

      {/* Upcoming days */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Jours à venir
        </h2>

        {upcomingDays.length === 0 ? (
          <p className="text-sm text-muted">Aucun jour de tournage planifié.</p>
        ) : (
          upcomingDays.map((day) => <ProductionDayCard key={day.id} day={day} />)
        )}
      </div>
    </div>
  );
}
