import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const VARIANT_CLASSES = {
  primary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400",
  ghost: "hover:bg-slate-100 text-slate-600 focus:ring-slate-400",
  danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
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
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
