import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md";
  showText?: boolean;
  href?: string;
  className?: string;
  /** Use white-on-transparent style for dark panels (e.g. auth left panel) */
  variant?: "default" | "white";
}

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className,
  variant = "default",
}: LogoProps) {
  const sizeMap = {
    sm: { box: "h-6 w-6 rounded text-[8px]", text: "text-sm" },
    md: { box: "h-9 w-9 rounded-lg text-sm", text: "text-lg" },
  };

  const s = sizeMap[size];

  const variantMap = {
    default: {
      box: "bg-primary text-primary-foreground",
      text: "text-foreground",
    },
    white: {
      box: "bg-white/20 backdrop-blur-sm text-white",
      text: "text-white",
    },
  };

  const v = variantMap[variant];

  const content = (
    <>
      <div
        className={cn(
          "flex items-center justify-center font-bold leading-none",
          s.box,
          v.box,
        )}
      >
        QE
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", s.text, v.text)}>
          QuraEx
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("flex items-center gap-2.5", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {content}
    </div>
  );
}
