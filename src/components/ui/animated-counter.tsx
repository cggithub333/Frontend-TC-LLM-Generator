"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnimated]);

  function animate() {
    // Extract numeric part and suffix
    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplayed(value);
      return;
    }

    const target = parseFloat(match[1]);
    const suffix = match[2]; // e.g. "x", "%", "+"
    const isDecimal = match[1].includes(".");
    const duration = 1500;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * target;

      if (isDecimal) {
        setDisplayed(current.toFixed(1) + suffix);
      } else {
        setDisplayed(Math.round(current) + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayed(value);
      }
    }

    requestAnimationFrame(step);
  }

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}
