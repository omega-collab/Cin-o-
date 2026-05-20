import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, strong = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-card-strong" : "glass-card",
        "rounded-app",
        onClick && "cursor-pointer transition-opacity active:opacity-80",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
