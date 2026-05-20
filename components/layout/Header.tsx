import { Film, Settings } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="px-4 md:px-6 pt-5 pb-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyanSoft flex items-center justify-center">
            <Film className="w-4 h-4 text-cyan" />
          </div>
          <span className="font-semibold text-base text-white">CinéO</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm overflow-hidden">
            👩🏻
            <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060b12]" />
          </div>
          <button className="w-9 h-9 rounded-2xl glass-card flex items-center justify-center">
            <Settings className="w-4 h-4 text-textSoft" />
          </button>
        </div>
      </div>

      {title && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
