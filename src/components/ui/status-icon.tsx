import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatusVariant = "primary" | "success" | "warning" | "error";

interface StatusIconProps {
  icon: LucideIcon;
  variant?: StatusVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { wrapper: "w-14 h-14", icon: "w-7 h-7" },
  md: { wrapper: "w-16 h-16", icon: "w-8 h-8" },
  lg: { wrapper: "w-20 h-20", icon: "w-10 h-10" },
};

const variantMap: Record<StatusVariant, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusIcon({
  icon: Icon,
  variant = "primary",
  size = "md",
  className,
}: StatusIconProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "rounded-full border flex items-center justify-center",
        s.wrapper,
        variantMap[variant],
        className,
      )}
    >
      <Icon className={s.icon} />
    </div>
  );
}
