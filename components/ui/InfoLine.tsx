import { cn } from "@/lib/utils";

interface InfoLineProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoLine({ label, value, className }: InfoLineProps) {
  return (
    <div className={cn("flex items-start gap-2 text-sm", className)}>
      <span className="text-slate-500 shrink-0 w-28">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}
