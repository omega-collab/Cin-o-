"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Info, Plus, Trash2 } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import type { ShootSequence, CastMember, DeptNote, PlacePoint, ShootAlert } from "@/lib/types/shoot";

const INPUT = "bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full placeholder:text-muted";

function Section({ title, count, children, defaultOpen = false }: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-app overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
          {count !== undefined && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-muted">{count}</span>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      {children}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "info" | "warning" | "critical" }) {
  const map = {
    info: { icon: Info, cls: "text-blueSoft bg-blueSoft/10" },
    warning: { icon: AlertTriangle, cls: "text-orangeSoft bg-orangeSoft/10" },
    critical: { icon: AlertTriangle, cls: "text-redSoft bg-redSoft/10" },
  };
  const { icon: Icon, cls } = map[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {severity}
    </span>
  );
}

export function AdminExtractionReview({ onApply }: { onApply: () => void }) {
  const {
    shoot,
    pendingExtraction,
    applyPendingExtraction,
    updateField,
    setSequences,
    setCast,
    setDeptNotes,
    setPlaces,
    setAlerts,
  } = useShootStore();

  const [applied, setApplied] = useState(false);
  const appliedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!appliedRef.current && pendingExtraction) {
      appliedRef.current = true;
      applyPendingExtraction();
    }
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seqs = shoot.sequences;
  const cast = shoot.cast;
  const deptNotes = shoot.deptNotes;
  const places = shoot.places;
  const alerts = shoot.alerts;

  function handleApply() {
    setApplied(true);
    timerRef.current = setTimeout(() => {
      setApplied(false);
      onApply();
    }, 1200);
  }

  function addSeq() {
    setSequences([...seqs, { id: crypto.randomUUID(), time: "", label: "", location: "" }]);
  }

  function patchSeq(id: string, key: keyof ShootSequence, val: string) {
    setSequences(seqs.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  }

  function rmSeq(id: string) {
    setSequences(seqs.filter((s) => s.id !== id));
  }

  function addCast() {
    setCast([...cast, { id: crypto.randomUUID(), name: "", role: "" }]);
  }

  function patchCast(id: string, key: keyof CastMember, val: string) {
    setCast(cast.map((c) => (c.id === id ? { ...c, [key]: val } : c)));
  }

  function rmCast(id: string) {
    setCast(cast.filter((c) => c.id !== id));
  }

  function addNote() {
    setDeptNotes([...deptNotes, { id: crypto.randomUUID(), department: "", content: "", priority: "info" }]);
  }

  function patchNote(id: string, key: keyof DeptNote, val: string) {
    setDeptNotes(deptNotes.map((n) => (n.id === id ? { ...n, [key]: val } : n)));
  }

  function rmNote(id: string) {
    setDeptNotes(deptNotes.filter((n) => n.id !== id));
  }

  function addPlace() {
    setPlaces([...places, { id: crypto.randomUUID(), label: "", description: "" }]);
  }

  function patchPlace(id: string, key: keyof PlacePoint, val: string) {
    setPlaces(places.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  }

  function rmPlace(id: string) {
    setPlaces(places.filter((p) => p.id !== id));
  }

  function addAlert() {
    setAlerts([...alerts, { id: crypto.randomUUID(), severity: "info", message: "" }]);
  }

  function patchAlert(id: string, key: keyof ShootAlert, val: string) {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, [key]: val } : a)));
  }

  function rmAlert(id: string) {
    setAlerts(alerts.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      {pendingExtraction && (
        <div className="flex items-center gap-2 p-3 bg-cyanSoft rounded-2xl">
          <CheckCircle2 className="w-4 h-4 text-cyan shrink-0" />
          <p className="text-xs text-cyan font-medium">
            Données extraites — vérifiez et corrigez avant d'appliquer.
          </p>
        </div>
      )}

      {/* General info */}
      <Section title="Informations générales" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Row label="Titre du projet">
            <input
              value={pendingExtraction?.projectTitle?.value ?? shoot.projectTitle}
              onChange={(e) => updateField({ projectTitle: e.target.value })}
              className={INPUT}
            />
          </Row>
          <Row label="Saison / Bloc">
            <input
              value={pendingExtraction?.series?.value ?? shoot.series ?? ""}
              onChange={(e) => updateField({ series: e.target.value })}
              className={INPUT}
            />
          </Row>
          <Row label="Jour J">
            <input
              type="number"
              value={pendingExtraction?.shootingDay?.value ?? shoot.shootingDay}
              onChange={(e) => updateField({ shootingDay: Number(e.target.value) })}
              className={INPUT}
            />
          </Row>
          <Row label="Total jours">
            <input
              type="number"
              value={pendingExtraction?.totalDays?.value ?? shoot.totalDays ?? ""}
              onChange={(e) => updateField({ totalDays: Number(e.target.value) })}
              className={INPUT}
            />
          </Row>
          <Row label="Date">
            <input
              type="date"
              value={pendingExtraction?.date?.value ?? shoot.date}
              onChange={(e) => updateField({ date: e.target.value })}
              className={INPUT}
            />
          </Row>
          <Row label="Météo">
            <input
              value={pendingExtraction?.weather?.value ?? shoot.weather ?? ""}
              onChange={(e) => updateField({ weather: e.target.value })}
              className={INPUT}
            />
          </Row>
        </div>
        <Row label="Lieu du tournage">
          <input
            value={pendingExtraction?.location?.value ?? shoot.location}
            onChange={(e) => updateField({ location: e.target.value })}
            className={INPUT}
          />
        </Row>
        <div className="grid grid-cols-3 gap-2">
          <Row label="Call Time">
            <input type="time" value={pendingExtraction?.callTime?.value ?? shoot.callTime} onChange={(e) => updateField({ callTime: e.target.value })} className={INPUT} />
          </Row>
          <Row label="Repas">
            <input type="time" value={pendingExtraction?.mealTime?.value ?? shoot.mealTime} onChange={(e) => updateField({ mealTime: e.target.value })} className={INPUT} />
          </Row>
          <Row label="Fin">
            <input type="time" value={pendingExtraction?.wrapTime?.value ?? shoot.wrapTime ?? ""} onChange={(e) => updateField({ wrapTime: e.target.value })} className={INPUT} />
          </Row>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Row label="Loges / HMC">
            <input value={pendingExtraction?.logeLocation?.value ?? shoot.logeLocation ?? ""} onChange={(e) => updateField({ logeLocation: e.target.value })} className={INPUT} />
          </Row>
          <Row label="Cantine">
            <input value={pendingExtraction?.canteenLocation?.value ?? shoot.canteenLocation ?? ""} onChange={(e) => updateField({ canteenLocation: e.target.value })} className={INPUT} />
          </Row>
        </div>
      </Section>

      {/* Sequences */}
      <Section title="Déroulé" count={seqs.length}>
        {seqs.map((seq) => (
          <div key={seq.id} className="space-y-2 p-3 bg-white/3 rounded-xl relative">
            <button onClick={() => rmSeq(seq.id)} className="absolute top-2 right-2 text-muted hover:text-redSoft">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-muted block mb-1">Heure</label>
                <input value={seq.time} onChange={(e) => patchSeq(seq.id, "time", e.target.value)} placeholder="08:30" className={INPUT + " font-mono"} />
              </div>
              <div className="col-span-3">
                <label className="text-xs text-muted block mb-1">Séquence</label>
                <input value={seq.label} onChange={(e) => patchSeq(seq.id, "label", e.target.value)} placeholder="Séq. 802 – ..." className={INPUT} />
              </div>
            </div>
            <input value={seq.location} onChange={(e) => patchSeq(seq.id, "location", e.target.value)} placeholder="EXT. PLAGE – MATIN" className={INPUT} />
          </div>
        ))}
        <button onClick={addSeq} className="flex items-center gap-1.5 text-xs text-cyan">
          <Plus className="w-3.5 h-3.5" /> Ajouter une séquence
        </button>
      </Section>

      {/* Cast */}
      <Section title="Comédiens" count={cast.length}>
        {cast.map((c) => (
          <div key={c.id} className="grid grid-cols-2 gap-2 items-start relative">
            <button onClick={() => rmCast(c.id)} className="absolute -top-1 right-0 text-muted hover:text-redSoft">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input value={c.name} onChange={(e) => patchCast(c.id, "name", e.target.value)} placeholder="Prénom / Personnage" className={INPUT} />
            <input value={c.role} onChange={(e) => patchCast(c.id, "role", e.target.value)} placeholder="Rôle" className={INPUT} />
            <input value={c.callTime ?? ""} onChange={(e) => patchCast(c.id, "callTime", e.target.value)} placeholder="Call: 08:00" className={INPUT} />
            <input value={c.logeLocation ?? ""} onChange={(e) => patchCast(c.id, "logeLocation", e.target.value)} placeholder="Loge" className={INPUT} />
          </div>
        ))}
        <button onClick={addCast} className="flex items-center gap-1.5 text-xs text-cyan">
          <Plus className="w-3.5 h-3.5" /> Ajouter un comédien
        </button>
      </Section>

      {/* Alerts */}
      <Section title="Alertes" count={alerts.length}>
        {alerts.map((a) => (
          <div key={a.id} className="flex gap-2 items-start">
            <select
              value={a.severity}
              onChange={(e) => patchAlert(a.id, "severity", e.target.value)}
              className="bg-white/5 border border-stroke rounded-xl px-2 py-2 text-xs text-white focus:outline-none w-24 shrink-0"
            >
              <option value="info" className="bg-appBg">info</option>
              <option value="warning" className="bg-appBg">warning</option>
              <option value="critical" className="bg-appBg">critical</option>
            </select>
            <input value={a.message} onChange={(e) => patchAlert(a.id, "message", e.target.value)} placeholder="Message d'alerte" className={INPUT} />
            <button onClick={() => rmAlert(a.id)} className="text-muted hover:text-redSoft shrink-0 pt-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addAlert} className="flex items-center gap-1.5 text-xs text-cyan">
          <Plus className="w-3.5 h-3.5" /> Ajouter une alerte
        </button>
      </Section>

      {/* Dept notes */}
      <Section title="Notes départements" count={deptNotes.length}>
        {deptNotes.map((n) => (
          <div key={n.id} className="space-y-1.5 relative p-2 bg-white/3 rounded-xl">
            <button onClick={() => rmNote(n.id)} className="absolute top-2 right-2 text-muted hover:text-redSoft">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <input value={n.department} onChange={(e) => patchNote(n.id, "department", e.target.value)} placeholder="Département" className={INPUT} />
              <select
                value={n.priority}
                onChange={(e) => patchNote(n.id, "priority", e.target.value)}
                className="bg-white/5 border border-stroke rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
              >
                <option value="info" className="bg-appBg">info</option>
                <option value="warning" className="bg-appBg">warning</option>
                <option value="critical" className="bg-appBg">critical</option>
              </select>
            </div>
            <input value={n.content} onChange={(e) => patchNote(n.id, "content", e.target.value)} placeholder="Contenu de la note" className={INPUT} />
          </div>
        ))}
        <button onClick={addNote} className="flex items-center gap-1.5 text-xs text-cyan">
          <Plus className="w-3.5 h-3.5" /> Ajouter une note
        </button>
      </Section>

      {/* Places */}
      <Section title="Lieux" count={places.length}>
        {places.map((p) => (
          <div key={p.id} className="grid grid-cols-3 gap-2 items-start relative">
            <button onClick={() => rmPlace(p.id)} className="absolute -top-1 right-0 text-muted hover:text-redSoft">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input value={p.label} onChange={(e) => patchPlace(p.id, "label", e.target.value)} placeholder="Label" className={INPUT} />
            <input value={p.description} onChange={(e) => patchPlace(p.id, "description", e.target.value)} placeholder="Description" className={INPUT} />
            <input value={p.distance ?? ""} onChange={(e) => patchPlace(p.id, "distance", e.target.value)} placeholder="Distance" className={INPUT} />
          </div>
        ))}
        <button onClick={addPlace} className="flex items-center gap-1.5 text-xs text-cyan">
          <Plus className="w-3.5 h-3.5" /> Ajouter un lieu
        </button>
      </Section>

      {/* Apply */}
      <button
        onClick={handleApply}
        className={`active-pill w-full py-3 rounded-2xl font-semibold text-sm transition-opacity ${applied ? "opacity-60" : ""}`}
      >
        {applied ? "Appliqué ✓" : pendingExtraction ? "Appliquer l'extraction" : "Valider et continuer"}
      </button>
    </div>
  );
}
