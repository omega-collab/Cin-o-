import { Film, Zap, Wrench, Mic, ClipboardList, Palette, Scissors, Target, UtensilsCrossed, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DepartmentSlug } from "@/lib/types";

export const DEPT_ICONS: Record<DepartmentSlug, LucideIcon> = {
  camera:     Film,
  electro:    Zap,
  machino:    Wrench,
  son:        Mic,
  regie:      ClipboardList,
  deco:       Palette,
  hmc:        Scissors,
  production: Target,
  cantine:    UtensilsCrossed,
  direction:  Camera,
};
