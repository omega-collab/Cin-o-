"use client";

import { useState } from "react";
import { Settings, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/useUserStore";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

function getBackHref(pathname: string): string | null {
  if (/^\/departments\/[^/]+\/history$/.test(pathname))
    return pathname.replace("/history", "");
  if (/^\/departments\/[^/]+$/.test(pathname)) return "/departments";
  if (pathname === "/cantine") return "/";
  if (pathname === "/documents") return "/admin";
  return null;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const avatarId = useUserStore((s) => s.avatarId);
  const pathname = usePathname();
  const router = useRouter();
  const backHref = getBackHref(pathname);

  return (
    <>
      <header className="px-4 md:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          {/* Left: back button on sub-pages, logo on top-level */}
          {backHref ? (
            <button
              onClick={() => router.push(backHref)}
              className="flex items-center gap-1.5 text-muted hover:text-white transition-colors -ml-1"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </button>
          ) : (
            <div className="flex items-center">
              <img src="/logo-wordmark.png" alt="CinéO" style={{ height: 24 }} className="object-contain" />
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Avatar — accès rapide au profil */}
            <button
              onClick={() => setShowProfile(true)}
              className="relative shrink-0"
              title="Mon profil"
            >
              <AvatarDisplay avatarId={avatarId} size={32} />
              <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060b12]" />
            </button>

            {/* Roue — Paramètres complets */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-2xl glass-card flex items-center justify-center"
              title="Paramètres"
            >
              <Settings className="w-4 h-4 text-textSoft" />
            </button>
          </div>
        </div>

        {title && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        )}
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
