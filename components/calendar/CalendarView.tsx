"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Film, Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";
import type { ProductionDay } from "@/lib/data/calendar";
import { useShootStore } from "@/lib/store/useShootStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { DEPARTMENTS } from "@/lib/data/departments";

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

// One cell in the month grid (can belong to the previous/current/next month).
interface MonthDay {
  date: string;     // ISO YYYY-MM-DD
  dayNum: number;   // 1-31
  inMonth: boolean; // false → grey out (spillover from prev/next month)
  hasEvent: boolean;
  isToday: boolean;
}

// Build a 6-row × 7-col grid (42 cells) covering the month of `monthOffset`
// relative to today's month. Weeks start on Monday (FR convention).
function getMonthGrid(today: Date, monthOffset: number, eventDates: Set<string>): MonthDay[] {
  const anchor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  // Monday = 0, Sunday = 6 (FR week starts Monday)
  const firstDow = (firstOfMonth.getDay() + 6) % 7;
  // Start grid on the Monday of the week containing day 1
  const gridStart = new Date(year, month, 1 - firstDow);

  const todayISO = toISODate(today);
  const cells: MonthDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = toISODate(d);
    cells.push({
      date: iso,
      dayNum: d.getDate(),
      inMonth: d.getMonth() === month,
      hasEvent: eventDates.has(iso),
      isToday: iso === todayISO,
    });
  }
  return cells;
}

function frMonthYear(today: Date, monthOffset: number): string {
  const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
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

function MonthCell({
  cell, isSelected, onClick,
}: {
  cell: MonthDay; isSelected: boolean; onClick: () => void;
}) {
  const baseDayBg = isSelected
    ? "bg-cyan text-appBg"
    : cell.isToday
      ? "bg-cyanSoft text-cyan ring-1 ring-cyan/40"
      : cell.hasEvent
        ? "bg-cyan/15 text-cyan font-semibold"
        : cell.inMonth
          ? "text-textSoft"
          : "text-muted/40";
  return (
    <button
      onClick={onClick}
      className="aspect-square flex items-center justify-center relative active:scale-95 transition-transform"
      style={{ minWidth: 0 }}
      aria-pressed={isSelected}
      aria-label={`${cell.dayNum}${cell.hasEvent ? " — événement" : ""}`}
    >
      <span
        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${baseDayBg}`}
      >
        {cell.dayNum}
      </span>
      {cell.hasEvent && !isSelected && (
        <span className="w-1 h-1 rounded-full absolute bottom-0.5 bg-cyan" />
      )}
    </button>
  );
}

function ProductionDayCard({ day }: { day: ProductionDay }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_CONFIG[day.status];
  const p = PERIOD_CONFIG[day.period];
  const endDisplay = day.endTime && day.endTime !== "00:00" ? day.endTime : null;
  const hasDetails = !!(day.sets || day.scenes.length > 0 || day.mealTime || day.interior);
  // Day is "empty" when extraction returned only the date/shootingDay header
  // with no usable details. Happens on dense one-page PDTs where OCR fails.
  const isEmpty = !day.location && !day.startTime && !day.effects && !hasDetails;

  return (
    <div className="glass-card rounded-app overflow-hidden border border-stroke/50">
      <div className="p-4 space-y-3">
        {/* Row 1: label + date + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-cyan">{day.label}</span>
          <span className="text-sm font-semibold text-white capitalize flex-1 truncate">
            {frDayMonth(day.date)}
          </span>
          {isEmpty ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
              Données incomplètes
            </span>
          ) : (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>
              {s.label}
            </span>
          )}
        </div>

        {/* Row 2: location — hidden when empty (no fake "—") */}
        {day.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-muted shrink-0" />
            <span className="text-xs text-textSoft break-words">{day.location}</span>
          </div>
        )}

        {/* Row 3: horaires + effets — only when we actually have a value */}
        {(day.startTime || day.effects) && (
          <div className="flex items-center gap-2 flex-wrap">
            {day.startTime && (
              <span className="text-xs font-mono font-semibold text-textSoft">
                {day.startTime}{endDisplay ? ` — ${endDisplay}` : ""}
              </span>
            )}
            {day.effects && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${p.bg} ${p.color}`}>
                {day.effects}
              </span>
            )}
          </div>
        )}

        {/* Helpful message when nothing was extracted for this day */}
        {isEmpty && (
          <p className="text-[11px] text-muted italic">
            Le PDT n&apos;a pas donné de détails pour ce jour. Ré-importez une version moins condensée si possible.
          </p>
        )}

        {/* Détails dépliables */}
        {expanded && (
          <div className="space-y-2.5 pt-1 border-t border-stroke/30">
            {/* Décors */}
            {day.sets && (
              <div className="text-xs text-muted leading-snug">
                {day.sets}
              </div>
            )}

            {/* INT/EXT + Repas */}
            <div className="flex items-center gap-2 flex-wrap">
              {day.interior && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/8 text-muted tracking-wide">
                  {day.interior}
                </span>
              )}
              {day.mealTime && (
                <span className="text-[10px] text-muted font-medium">
                  Repas {day.mealTime}
                </span>
              )}
            </div>

            {/* Séquences */}
            {day.scenes.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Film size={11} className="text-muted shrink-0" />
                {day.scenes.map((scene) => (
                  <span key={scene} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted font-mono">
                    {scene}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Voir plus / Voir moins */}
        {hasDetails && (
          <button
            onClick={() => setExpanded((o) => !o)}
            className="text-[10px] font-semibold text-cyan active:opacity-70 transition-opacity"
          >
            {expanded ? "Voir moins ▲" : "Voir plus ▼"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── PDT import types ──────────────────────────────────────────────────────────

type PdtStatus = "idle" | "loading" | "success" | "warning" | "error";

// ── main component ────────────────────────────────────────────────────────────

export function CalendarView() {
  const { shoot, mergeNextDays } = useShootStore();
  const department = useUserStore((s) => s.department);
  const isAdmin = department === "production";
  const today = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [monthOffset, setMonthOffset] = useState(0);
  const [pdtStatus, setPdtStatus] = useState<PdtStatus>("idle");
  const [pdtMessage, setPdtMessage] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("mine");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveDept = deptFilter === "mine" ? department : deptFilter;

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

      const data = await res.json() as {
        days?: unknown[];
        error?: string;
        warning?: string | null;
        ocrPageCount?: number;
        ocrCharCount?: number;
      };
      if (!res.ok || data.error) {
        setPdtStatus("error");
        setPdtMessage(data.error ?? "Erreur inconnue");
        return;
      }

      const days = data.days ?? [];
      mergeNextDays(days as Parameters<typeof mergeNextDays>[0]);
      // Warning case (too few days extracted) gets a visible warning state so
      // the user knows to retry with a better-quality PDT.
      if (data.warning) {
        setPdtStatus("warning");
        setPdtMessage(`${days.length} jour(s) importé(s) — ${data.warning}`);
      } else {
        setPdtStatus("success");
        setPdtMessage(`${days.length} jour(s) importé(s)`);
      }
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
      // Don't fake values when extraction was partial — keep empty strings
      // so ProductionDayCard can show "Données incomplètes" instead of
      // misleading defaults like "08:00 JOUR".
      const callT = nd.callTime ?? "";
      const isNight = nd.effects
        ? /nuit/i.test(nd.effects)
        : callT
          ? calcPeriod(callT) === "night"
          : false;
      days.push({
        id: `j${nd.shootingDay}`,
        label: `J${nd.shootingDay}`,
        date: nd.date,
        location: nd.location ?? "",
        scenes: nd.sequences ?? (nd.summary ? [nd.summary] : []),
        startTime: callT,
        endTime: nd.wrapTime ?? "",
        period: isNight ? "night" : "day",
        status: "confirmed",
        mealTime: nd.mealTime,
        effects: nd.effects,
        interior: nd.interior,
        sets: nd.sets,
      });
    }

    return days;
  }, [shoot]);

  const eventDateSet = useMemo(
    () => new Set(productionDays.map((d) => d.date)),
    [productionDays]
  );
  const monthGrid = useMemo(
    () => getMonthGrid(new Date(), monthOffset, eventDateSet),
    [monthOffset, eventDateSet]
  );
  const monthYear = useMemo(() => frMonthYear(new Date(), monthOffset), [monthOffset]);

  // Sort all production days chronologically. Past days remain visible —
  // critical for users who import a PDT mid-shoot and want to consult the
  // whole planning, not just what's left to film.
  const sortedDays = useMemo(
    () => [...productionDays].sort((a, b) => a.date.localeCompare(b.date)),
    [productionDays]
  );

  // When user picks a specific day in the week strip, only show that day.
  // Otherwise show everything.
  const visibleDays = useMemo(() => {
    if (selectedDate === today) return sortedDays;
    return sortedDays.filter((d) => d.date === selectedDate);
  }, [sortedDays, selectedDate, today]);

  const futureCount = useMemo(
    () => sortedDays.filter((d) => d.date >= today).length,
    [sortedDays, today]
  );
  const pastCount = sortedDays.length - futureCount;

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
          {pdtStatus === "warning" && (
            <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-xl p-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{pdtMessage}</span>
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

      {/* Month calendar grid */}
      <div className="glass-card rounded-app p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass-card text-textSoft"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-textSoft capitalize">{monthYear}</span>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass-card text-textSoft"
            aria-label="Mois suivant"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday header — fixed labels above the grid */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-[10px] font-semibold tracking-widest uppercase text-muted text-center py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* 6×7 grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {monthGrid.map((cell) => (
            <MonthCell
              key={cell.date}
              cell={cell}
              isSelected={cell.date === selectedDate}
              onClick={() => setSelectedDate(cell.date)}
            />
          ))}
        </div>

        {/* Today shortcut */}
        {(monthOffset !== 0 || selectedDate !== today) && (
          <button
            onClick={() => { setMonthOffset(0); setSelectedDate(today); }}
            className="mt-3 w-full py-1.5 text-[11px] text-cyan font-semibold"
          >
            Aller à aujourd&apos;hui
          </button>
        )}
      </div>

      {/* Planning */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            {selectedDate === today
              ? `Planning · ${sortedDays.length} jour${sortedDays.length > 1 ? "s" : ""}`
              : `Tournage · ${frDayMonth(selectedDate)}`}
          </h2>
          {selectedDate === today && pastCount > 0 && (
            <span className="text-[10px] text-muted">
              {pastCount} passé{pastCount > 1 ? "s" : ""} · {futureCount} à venir
            </span>
          )}
        </div>

        {/* Department filter chips — shown only when there are days */}
        {productionDays.length > 0 && (
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-1.5 flex-nowrap pb-1">
              <button
                onClick={() => setDeptFilter("mine")}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                  deptFilter === "mine" ? "bg-cyanSoft text-cyan" : "bg-white/5 text-muted"
                }`}
              >
                Ma section
              </button>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => setDeptFilter(d.slug)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    deptFilter === d.slug ? "bg-cyanSoft text-cyan" : "bg-white/5 text-muted"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
