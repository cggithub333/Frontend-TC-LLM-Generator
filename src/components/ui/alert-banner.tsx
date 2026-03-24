import { AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "warning" | "info" | "success";

interface AlertBannerProps {
  message: string;
  variant?: AlertVariant;
  className?: string;
}

const config: Record<AlertVariant, { icon: typeof AlertCircle; classes: string }> = {
  error: {
    icon: AlertCircle,
    classes: "border-destructive/30 bg-destructive/5 text-destructive dark:border-destructive/40 dark:bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-warning/30 bg-warning/5 text-warning dark:border-warning/40 dark:bg-warning/10",
  },
  info: {
    icon: AlertCircle,
    classes: "border-info/30 bg-info/5 text-info dark:border-info/40 dark:bg-info/10",
  },
  success: {
    icon: AlertCircle,
    classes: "border-success/30 bg-success/5 text-success dark:border-success/40 dark:bg-success/10",
  },
};

export function AlertBanner({ message, variant = "error", className }: AlertBannerProps) {
  const { icon: Icon, classes } = config[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in-up",
        classes,
        className,
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
