import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: { background: "#00D4B4", color: "#0B0C14" },
  secondary: { background: "#1C1D2B", color: "#8B8CA8" },
  ghost: { background: "transparent", color: "#8B8CA8" },
  danger: { background: "#EF4444", color: "#FFFFFF" },
};

const VARIANT_HOVER_CLASSES: Record<string, string> = {
  primary: "hover:bg-[#00BFA3]",
  secondary: "hover:bg-[#242535]",
  ghost: "hover:bg-[#1C1D2B]",
  danger: "hover:bg-red-600",
};

const SIZE_CLASSES = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-6 py-3 gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0B0C14] disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_HOVER_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
