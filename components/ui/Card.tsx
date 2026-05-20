import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        onClick && "cursor-pointer transition-opacity hover:opacity-90",
        className
      )}
      style={{
        background: "#13141F",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
