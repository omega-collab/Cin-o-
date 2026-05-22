"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Film, Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";
import type { ProductionDay } from "@/lib/data/calendar";
import { useShootStore } from "@/lib/store/useShootStore";
import { useUserStore } from "@/lib/store/useUserStore";

// ── helpers ───────────────────────────────────────────────────────────────────

const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;

function calcPeriod(callTime: string): "day" | "night" {
  const h = Number(callTime.split(":")[0]);
  return !isNaN(h) && (h >= 19 || h < 6) ? "night" : "day";
}

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

function getWeekDays(base: Date, offset: number, days: ProductionDay[] = []): WeekDay[] {
  const dow = base.getDay();
  const mondayDelta = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayDelta + offset * 7);
  const eventDates = new Set(days.map((d) => d.date));
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
  pending:   { label: "À vérifier", bg: "bg-warning/10",   color: "text-warning", border: "#FFB020" },
  cancelled: { label: "Annulé",    bg: "bg-danger/10",        color: "text-danger",    border: "#FF4D4D" },
};

const PERIOD_CONFIG: Record<Period, { label: string; bg: string; color: string }> = {
  day:   { label: "JOUR", bg: "bg-info/10",   color: "text-info"   },
  night: { label: "NUIT", bg: "bg-nightSoft/10", color: "text-night" },
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
  const endDisplay = day.endTime && day.endTime !== "00:00" ? day.endTime : "?";
  return (
    <div className="glass-card rounded-app overflow-hidden border border-stroke/50">
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
        {day.scenes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {day.scenes.map((scene) => (
              <span key={scene} className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted">
                {scene}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: times + period badge */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-mono font-semibold text-textSoft">
            {day.startTime} — {endDisplay}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide ${p.bg} ${p.color}`}>
            {p.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── PDT import types ──────────────────────────────────────────────────────────

type PdtStatus = "idle" | "loading" | "success" | "error";

// ── main component ────────────────────────────────────────────────────────────

export function CalendarView() {
  const { shoot, setNextDays } = useShootStore();
  const department = useUserStore((s) => s.department);
  const isAdmin = department === "production";
  const today = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const [pdtStatus, setPdtStatus] = useState<PdtStatus>("idle");
  const [pdtMessage, setPdtMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePdtFile(file: File) {
    if (!file) return;
    setPdtStatus("loading");
    setPdtMessage("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = () => reject(new Error("Lecture impossible"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/extract-pdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, pdfMime: file.type || "application/pdf" }),
      });

      const data = await res.json() as { days?: unknown[]; error?: string };
      if (!res.ok || data.error) {
        setPdtStatus("error");
        setPdtMessage(data.error ?? "Erreur inconnue");
        return;
      }

      const days = data.days ?? [];
      setNextDays(days as Parameters<typeof setNextDays>[0]);
      setPdtStatus("success");
      setPdtMessage(`${days.length} jour(s) importé(s)`);
    } catch (err) {
      setPdtStatus("error");
      setPdtMessage(err instanceof Error ? err.message : "Erreur d'import");
    }
  }

  // Build ProductionDay list
  // — current day requires published FDS
  // — nextDays (PDT) are shown regardless of published state
  const productionDays = useMemo<ProductionDay[]>(() => {
    const days: ProductionDay[] = [];

    if (shoot.isPublished && shoot.date) {
      const callT = shoot.callTime || "08:00";
      days.push({
        id: `j${shoot.shootingDay}`,
        label: `J${shoot.shootingDay}`,
        date: shoot.date,
        location: shoot.location || "—",
        scenes: shoot.sequences.map((s) => s.label).slice(0, 5),
        startTime: callT,
        endTime: shoot.wrapTime || "",
        period: calcPeriod(callT),
        status: "confirmed",
      });
    }

    for (const nd of shoot.nextDays) {
      const callT = nd.callTime || "08:00";
      days.push({
        id: `j${nd.shootingDay}`,
        label: `J${nd.shootingDay}`,
        date: nd.date,
        location: nd.location || "—",
        scenes: nd.summary ? [nd.summary] : [],
        startTime: callT,
        endTime: "",
        period: calcPeriod(callT),
        status: "confirmed",
      });
    }

    return days;
  }, [shoot]);

  const weekDays = useMemo(() => getWeekDays(new Date(), weekOffset, productionDays), [weekOffset, productionDays]);
  const monthYear = useMemo(() => frMonthYear(new Date(), weekOffset), [weekOffset]);

  const upcomingDays = useMemo(
    () => productionDays.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [productionDays, today]
  );

  // A2: filter by selectedDate when a specific day is clicked
  const visibleDays = useMemo(() => {
    if (selectedDate === today) return upcomingDays;
    return upcomingDays.filter((d) => d.date === selectedDate);
  }, [upcomingDays, selectedDate, today]);

  return (
    <div className="space-y-5">
      {/* PDT Import — admin only */}
      {isAdmin && (
        <div className="glass-card rounded-app p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Plan de travail (PDT)</p>
              <p className="text-xs text-muted mt-0.5">Importez le PDT PDF pour peupler le calendrier</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={pdtStatus === "loading"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyanSoft text-cyan active:opacity-70 transition-opacity disabled:opacity-40"
            >
              {pdtStatus === "loading" ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {pdtStatus === "loading" ? "Analyse…" : "Importer PDT"}
            </button>
          </div>

          {pdtStatus === "success" && (
            <div className="flex items-center gap-2 text-xs text-cyan">
              <CheckCircle size={13} />
              <span>{pdtMessage}</span>
            </div>
          )}
          {pdtStatus === "error" && (
            <div className="flex items-center gap-2 text-xs text-danger">
              <AlertCircle size={13} />
              <span>{pdtMessage}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handlePdtFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}

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
          {selectedDate === today ? "Jours à venir" : `Tournage · ${frDayMonth(selectedDate)}`}
        </h2>

        {visibleDays.length === 0 ? (
          <div className="glass-card rounded-app p-6 text-center space-y-2">
            <Film className="w-8 h-8 text-muted mx-auto" />
            <p className="text-sm text-muted">
              {selectedDate !== today
                ? "Aucun tournage prévu ce jour."
                : "Aucun jour de tournage à venir. Importez le PDT pour peupler le calendrier."}
            </p>
          </div>
        ) : (
          visibleDays.map((day) => <ProductionDayCard key={day.id} day={day} />)
        )}
      </div>
    </div>
  );
}
