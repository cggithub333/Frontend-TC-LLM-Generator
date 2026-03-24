import Link from "next/link";
import Image from "next/image";
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
    sm: { img: 24, text: "text-sm" },
    md: { img: 36, text: "text-lg" },
  };

  const s = sizeMap[size];

  const variantMap = {
    default: {
      text: "text-foreground",
    },
    white: {
      text: "text-white",
    },
  };

  const v = variantMap[variant];

  const content = (
    <>
      <Image
        src="/image-removebg-preview.png"
        alt="QuraEx Logo"
        width={s.img}
        height={s.img}
        className="object-contain"
        priority
      />
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
