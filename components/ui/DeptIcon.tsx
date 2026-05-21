import { Film, Zap, Wrench, Mic, ClipboardList, Palette, Sparkles, Clapperboard, UtensilsCrossed, HelpCircle } from "lucide-react";

const DEPT_ICONS: Record<string, React.ElementType> = {
  camera: Film,
  electro: Zap,
  machino: Wrench,
  son: Mic,
  regie: ClipboardList,
  deco: Palette,
  hmc: Sparkles,
  production: Clapperboard,
  cantine: UtensilsCrossed,
};

export function DeptIcon({ slug, className = "w-5 h-5" }: { slug: string; className?: string }) {
  const Icon = DEPT_ICONS[slug] ?? HelpCircle;
  return <Icon className={className} />;
}
