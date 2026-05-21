import React from "react";

export interface AvatarDef {
  id: string;
  label: string;
  bg: string;
  icon: React.ReactNode;
}

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {children}
    </svg>
  );
}

export const AVATARS: AvatarDef[] = [
  {
    id: "reel",
    label: "Bobine",
    bg: "#003D3A",
    icon: (
      <Svg>
        <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="2.2" />
        <circle cx="20" cy="20" r="4.5" fill="white" />
        {/* 6 holes */}
        <circle cx="20" cy="7.5" r="2.4" fill="white" />
        <circle cx="30.4" cy="13.75" r="2.4" fill="white" />
        <circle cx="30.4" cy="26.25" r="2.4" fill="white" />
        <circle cx="20" cy="32.5" r="2.4" fill="white" />
        <circle cx="9.6" cy="26.25" r="2.4" fill="white" />
        <circle cx="9.6" cy="13.75" r="2.4" fill="white" />
      </Svg>
    ),
  },
  {
    id: "clap",
    label: "Clap",
    bg: "#2D1B69",
    icon: (
      <Svg>
        {/* Board body */}
        <rect x="6" y="16" width="28" height="18" rx="2.5" fill="white" />
        {/* Stripe bar */}
        <rect x="6" y="10" width="28" height="7" rx="2" fill="white" />
        {/* Diagonal stripes */}
        <clipPath id="clap-clip">
          <rect x="6" y="10" width="28" height="7" rx="2" />
        </clipPath>
        <g clipPath="url(#clap-clip)" fill="rgba(45,27,105,0.9)">
          <rect x="4" y="8" width="5" height="12" transform="rotate(-15 4 8)" />
          <rect x="14" y="8" width="5" height="12" transform="rotate(-15 14 8)" />
          <rect x="24" y="8" width="5" height="12" transform="rotate(-15 24 8)" />
        </g>
        {/* Lines on body */}
        <line x1="8" y1="21.5" x2="32" y2="21.5" stroke="rgba(45,27,105,0.25)" strokeWidth="1.2" />
        <line x1="8" y1="26" x2="32" y2="26" stroke="rgba(45,27,105,0.25)" strokeWidth="1.2" />
        <line x1="8" y1="30.5" x2="32" y2="30.5" stroke="rgba(45,27,105,0.25)" strokeWidth="1.2" />
      </Svg>
    ),
  },
  {
    id: "camera",
    label: "Caméra",
    bg: "#0A3020",
    icon: (
      <Svg>
        {/* Body */}
        <rect x="5" y="14" width="22" height="16" rx="3" fill="white" />
        {/* Lens */}
        <circle cx="16" cy="22" r="6" fill="rgba(10,48,32,0.15)" stroke="rgba(10,48,32,0.4)" strokeWidth="1.5" />
        <circle cx="16" cy="22" r="3.5" fill="rgba(10,48,32,0.6)" />
        <circle cx="16" cy="22" r="1.5" fill="white" opacity="0.4" />
        {/* Viewfinder bump */}
        <rect x="18" y="10" width="9" height="6" rx="1.5" fill="white" />
        {/* Flash/detail */}
        <rect x="23" y="14" width="4" height="4" rx="1" fill="rgba(255,255,255,0.6)" />
        {/* Record dot */}
        <circle cx="25" cy="18" r="1.5" fill="#ef4444" />
      </Svg>
    ),
  },
  {
    id: "director",
    label: "Directeur",
    bg: "#3A2000",
    icon: (
      <Svg>
        {/* Megaphone cone */}
        <path d="M8 16 L8 26 L16 26 L32 32 L32 10 L16 16 Z" fill="white" />
        {/* Mouthpiece */}
        <rect x="5" y="16" width="5" height="10" rx="1.5" fill="white" opacity="0.85" />
        {/* Sound waves */}
        <path d="M33 15 Q37 20 33 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M33 11 Q40 20 33 29" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </Svg>
    ),
  },
  {
    id: "light",
    label: "Lumière",
    bg: "#3A1500",
    icon: (
      <Svg>
        {/* Lamp head */}
        <ellipse cx="20" cy="12" rx="9" ry="6" fill="white" />
        {/* Light cone */}
        <path d="M12 17 L6 36 L34 36 L28 17 Z" fill="white" opacity="0.6" />
        {/* Rays */}
        <line x1="20" y1="36" x2="20" y2="40" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <line x1="10" y1="36" x2="7" y2="40" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <line x1="30" y1="36" x2="33" y2="40" stroke="white" strokeWidth="1.5" opacity="0.3" />
        {/* Bulb */}
        <circle cx="20" cy="12" r="3.5" fill="rgba(255,220,100,0.9)" />
      </Svg>
    ),
  },
  {
    id: "star",
    label: "Étoile",
    bg: "#3A0020",
    icon: (
      <Svg>
        <polygon
          points="20,5 24.5,15 36,16 27.5,24 30,35 20,29 10,35 12.5,24 4,16 15.5,15"
          fill="white"
        />
      </Svg>
    ),
  },
  {
    id: "lens",
    label: "Objectif",
    bg: "#001A3A",
    icon: (
      <Svg>
        <circle cx="20" cy="20" r="15" stroke="white" strokeWidth="2" />
        <circle cx="20" cy="20" r="11" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <circle cx="20" cy="20" r="7" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.4" />
        {/* Aperture blades */}
        <line x1="20" y1="5" x2="20" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="31" x2="20" y2="35" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="20" x2="9" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="31" y1="20" x2="35" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Highlight */}
        <circle cx="15" cy="15" r="2" fill="white" opacity="0.3" />
      </Svg>
    ),
  },
  {
    id: "mic",
    label: "Son",
    bg: "#1A001A",
    icon: (
      <Svg>
        {/* Mic head */}
        <rect x="13" y="5" width="14" height="18" rx="7" fill="white" />
        {/* Boom arm */}
        <path d="M8 23 Q8 33 20 33" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* Stand */}
        <line x1="20" y1="33" x2="20" y2="38" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="14" y1="38" x2="26" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Grille lines */}
        <line x1="13" y1="11" x2="27" y2="11" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <line x1="13" y1="15" x2="27" y2="15" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <line x1="13" y1="19" x2="27" y2="19" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      </Svg>
    ),
  },
];

export function getAvatar(id: string | null | undefined): AvatarDef {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0]!;
}
