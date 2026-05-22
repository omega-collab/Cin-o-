import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-opacity disabled:opacity-40 focus:outline-none";

  if (variant === "primary") {
    return (
      <button className={cn(base, "active-pill", SIZE_CLASSES[size], className)} {...props}>
        {children}
      </button>
    );
  }

  const styles: Record<string, string> = {
    secondary: "glass-card text-textSoft hover:text-white",
    ghost: "text-muted hover:text-textSoft",
    danger: "bg-danger/10 text-danger border border-danger/20",
  };

  return (
    <button
      className={cn(base, styles[variant] ?? "", SIZE_CLASSES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
