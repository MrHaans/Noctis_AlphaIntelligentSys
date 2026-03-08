"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md";
}

const variantClasses: Record<string, string> = {
  default: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  danger: "bg-red-500/20 text-red-300 border border-red-500/30",
  info: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  muted: "bg-white/5 text-white/50 border border-white/10",
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
