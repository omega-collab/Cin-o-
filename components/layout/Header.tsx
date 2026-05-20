"use client";

import { formatDate } from "@/lib/utils";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const today = formatDate(new Date().toISOString());
  return (
    <header
      className="px-4 md:px-6 py-3 flex items-center justify-between"
      style={{ background: "#0B0C14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        )}
        <p className="text-sm capitalize" style={{ color: "#8B8CA8" }}>{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: "rgba(0,212,180,0.15)", color: "#00D4B4" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00D4B4" }}
          />
          En tournage
        </span>
      </div>
    </header>
  );
}
