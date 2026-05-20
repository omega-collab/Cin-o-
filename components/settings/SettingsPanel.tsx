"use client";

import { useState } from "react";
import { X, Moon, Sun, Type, Globe, User, Info, ChevronRight } from "lucide-react";
import { useSettingsStore, type Theme, type FontSize, type Lang } from "@/lib/store/useSettingsStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { DEPARTMENTS } from "@/lib/data/departments";
import { ProfileModal } from "@/components/profile/ProfileModal";

const APP_VERSION = "0.2.0";

function Row({
  icon,
  label,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stroke last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-muted">{icon}</span>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        active ? "bg-cyan" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex glass-card rounded-xl p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            value === opt.value ? "active-pill" : "text-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { theme, fontSize, lang, setTheme, setFontSize, setLang } = useSettingsStore();
  const { department, role } = useUserStore();
  const [showProfile, setShowProfile] = useState(false);

  const dept = DEPARTMENTS.find((d) => d.slug === department);

  const LANG_OPTIONS: { value: Lang; label: string }[] = [
    { value: "fr", label: "FR" },
    { value: "en", label: "EN" },
  ];

  const FONT_OPTIONS: { value: FontSize; label: string }[] = [
    { value: "sm", label: "A" },
    { value: "md", label: "A+" },
    { value: "lg", label: "A++" },
  ];

  if (showProfile) {
    return <ProfileModal onClose={() => { setShowProfile(false); onClose(); }} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-sm mx-4 mb-4 md:mb-0 glass-card-strong rounded-app overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
          <h2 className="text-base font-bold text-gradient">Paramètres</h2>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-2 divide-y divide-stroke/50 max-h-[75vh] overflow-y-auto">

          {/* Apparence */}
          <div className="py-3">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Apparence
            </p>

            <Row
              icon={theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              label={theme === "dark" ? "Mode sombre" : "Mode clair"}
              subtitle="Bascule l'apparence de l'interface"
            >
              <Toggle
                active={theme === "light"}
                onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </Row>

            <Row
              icon={<Type className="w-4 h-4" />}
              label="Taille du texte"
            >
              <SegmentControl
                options={FONT_OPTIONS}
                value={fontSize}
                onChange={setFontSize}
              />
            </Row>

            <Row
              icon={<Globe className="w-4 h-4" />}
              label="Langue"
              subtitle="Interface uniquement"
            >
              <SegmentControl
                options={LANG_OPTIONS}
                value={lang}
                onChange={setLang}
              />
            </Row>
          </div>

          {/* Compte */}
          <div className="py-3">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Mon compte
            </p>

            <button
              onClick={() => setShowProfile(true)}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted">
                  <User className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Département & poste</p>
                  {dept && role ? (
                    <p className="text-xs text-muted">
                      {dept.icon} {dept.name} · {role}
                    </p>
                  ) : (
                    <p className="text-xs text-muted">Non renseigné</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
          </div>

          {/* À propos */}
          <div className="py-3">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              À propos
            </p>

            <Row
              icon={<Info className="w-4 h-4" />}
              label="CinéO"
              subtitle="Feuille de service mobile"
            >
              <span className="text-xs text-muted font-mono">v{APP_VERSION}</span>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}
