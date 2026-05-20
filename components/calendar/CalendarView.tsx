"use client";

import { useState, useMemo } from "react";
import { PRODUCTION_DAYS } from "@/lib/data/calendar";
import type { ProductionDay } from "@/lib/data/calendar";

// ─── helpers ──────────────────────────────────────────────────────────────────

// Monday-first: index 0 = Monday … index 6 = Sunday
const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;

/** Returns "YYYY-MM-DD" for a given Date, without timezone shift */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface WeekDay {
  dayLabel: string;
  dayNum: number;
  date: string; // ISO
  hasEvent: boolean;
}

function getWeekDays(referenceDate: Date, weekOffset: number): WeekDay[] {
  // Monday-anchored week
  const ref = new Date(referenceDate);
  const dow = ref.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset + weekOffset * 7);

  const eventDates = new Set(PRODUCTION_DAYS.map((d) => d.date));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = toISODate(d);
    // (getDay() + 6) % 7 maps Sun=0→6, Mon=1→0, …, Sat=6→5 — aligns with DAY_LABELS
    const labelIdx = (d.getDay() + 6) % 7;
    return {
      dayLabel: DAY_LABELS[labelIdx] ?? "LUN",
      dayNum: d.getDate(),
      date: iso,
      hasEvent: eventDates.has(iso),
    };
  });
}

// ─── status helpers ────────────────────────────────────────────────────────────

type Status = ProductionDay["status"];

function statusBorderColor(status: Status): string {
  if (status === "confirmed") return "#00D4B4";
  if (status === "pending") return "#F97316";
  return "#EF4444";
}

function statusBadge(status: Status): { label: string; bg: string; color: string } {
  if (status === "confirmed") return { label: "Confirmé", bg: "rgba(0,212,180,0.15)", color: "#00D4B4" };
  if (status === "pending") return { label: "À vérifier", bg: "rgba(249,115,22,0.15)", color: "#F97316" };
  return { label: "Annulé", bg: "rgba(239,68,68,0.15)", color: "#EF4444" };
}

function periodBadge(period: ProductionDay["period"]): { label: string; bg: string; color: string } {
  if (period === "day") return { label: "JOUR", bg: "rgba(59,130,246,0.2)", color: "#60A5FA" };
  return { label: "NUIT", bg: "rgba(139,92,246,0.2)", color: "#A78BFA" };
}

// ─── French short weekday helper ──────────────────────────────────────────────

function frWeekDayShort(dateISO: string): string {
  const d = new Date(dateISO + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
}

function frDayMonth(dateISO: string): string {
  const d = new Date(dateISO + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DayColumn({
  day,
  isSelected,
  isToday,
  onClick,
}: {
  day: WeekDay;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-1 py-2 relative"
      style={{ minWidth: 0 }}
      aria-pressed={isSelected}
    >
      <span
        className="text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: isSelected ? "#00D4B4" : "#5A5B72" }}
      >
        {day.dayLabel}
      </span>

      {/* Day number circle */}
      <span
        className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors"
        style={
          isSelected
            ? { background: "#00D4B4", color: "#0B0C14" }
            : isToday
            ? { background: "rgba(0,212,180,0.15)", color: "#00D4B4" }
            : { color: "#C9CAE0" }
        }
      >
        {day.dayNum}
      </span>

      {/* Event dot */}
      {day.hasEvent && (
        <span
          className="w-1.5 h-1.5 rounded-full absolute bottom-1"
          style={{ background: isSelected ? "#0B0C14" : "#00D4B4" }}
        />
      )}
    </button>
  );
}

function ProductionDayCard({ day }: { day: ProductionDay }) {
  const border = statusBorderColor(day.status);
  const sBadge = statusBadge(day.status);
  const pBadge = periodBadge(day.period);
  const dayShort = frWeekDayShort(day.date);
  const dayMonth = frDayMonth(day.date);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "#13141F",
        borderRadius: "16px",
        borderLeft: `3px solid ${border}`,
      }}
    >
      <div className="p-4 space-y-3">
        {/* Row 1: label + date + status badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-sm font-bold"
            style={{ color: "#00D4B4" }}
          >
            {day.label}
          </span>
          <span className="text-sm font-semibold text-white capitalize">
            {dayShort}. {dayMonth}
          </span>
          {/* spacer */}
          <span className="flex-1" />
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: sBadge.bg, color: sBadge.color }}
          >
            {sBadge.label}
          </span>
        </div>

        {/* Row 2: location */}
        <div className="flex items-center gap-2">
          <span style={{ color: "#5A5B72", fontSize: "13px" }}>📍</span>
          <span
            className="text-xs truncate"
            style={{ color: "#5A5B72" }}
          >
            {day.location}
          </span>
        </div>

        {/* Row 3: scenes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {day.scenes.map((scene) => (
            <span
              key={scene}
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "#8788A0" }}
            >
              {scene}
            </span>
          ))}
        </div>

        {/* Row 4: times + period badge */}
        <div className="flex items-center justify-between pt-1">
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: "#C9CAE0" }}
          >
            {day.startTime} — {day.endTime}
          </span>
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide"
            style={{ background: pBadge.bg, color: pBadge.color }}
          >
            {pBadge.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export function CalendarView() {
  const today = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(
    () => getWeekDays(new Date(), weekOffset),
    [weekOffset]
  );

  // Filter: only upcoming days (>= today), sorted ascending
  const upcomingDays = useMemo(
    () =>
      PRODUCTION_DAYS.filter((d) => d.date >= today).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    [today]
  );

  return (
    <div className="space-y-6">
      {/* ── Week strip ── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#13141F" }}
      >
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "#C9CAE0" }}
            aria-label="Semaine précédente"
          >
            ‹
          </button>

          <span className="text-xs font-semibold" style={{ color: "#5A5B72" }}>
            {weekOffset === 0
              ? "Cette semaine"
              : weekOffset > 0
              ? `+${weekOffset} sem.`
              : `${weekOffset} sem.`}
          </span>

          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "#C9CAE0" }}
            aria-label="Semaine suivante"
          >
            ›
          </button>
        </div>

        {/* Day columns */}
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

      {/* ── Upcoming production days ── */}
      <div className="space-y-3">
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#5A5B72" }}
        >
          Jours de tournage à venir
        </h2>

        {upcomingDays.length === 0 ? (
          <p className="text-sm" style={{ color: "#5A5B72" }}>
            Aucun jour de tournage planifié.
          </p>
        ) : (
          upcomingDays.map((day) => (
            <ProductionDayCard key={day.id} day={day} />
          ))
        )}
      </div>
    </div>
  );
}
