"use client";

import { getAvatar } from "@/lib/data/avatars";

interface AvatarDisplayProps {
  avatarId: string | null | undefined;
  size?: number;
  className?: string;
}

export function AvatarDisplay({ avatarId, size = 32, className = "" }: AvatarDisplayProps) {
  const avatar = getAvatar(avatarId);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, background: avatar.bg }}
    >
      <span style={{ width: size * 0.65, height: size * 0.65, display: "flex" }}>
        {avatar.icon}
      </span>
    </span>
  );
}
