"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon?: LucideIcon;
  description?: string;
  accentColor?: "cyan" | "amber" | "emerald" | "purple";
  animationDelay?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  description,
  accentColor = "cyan",
  animationDelay = 0,
  className,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === "number" ? 0 : value
  );
  const cardRef = useRef<HTMLDivElement>(null);

  // Accent color mapping
  const accentColors = {
    cyan: {
      bg: "bg-[oklch(0.75_0.18_195/0.1)]",
      border: "border-[oklch(0.75_0.18_195/0.2)]",
      text: "text-[oklch(0.75_0.18_195)]",
      glow: "shadow-[0_0_30px_-10px_oklch(0.75_0.18_195/0.4)]",
    },
    amber: {
      bg: "bg-[oklch(0.78_0.16_75/0.1)]",
      border: "border-[oklch(0.78_0.16_75/0.2)]",
      text: "text-[oklch(0.78_0.16_75)]",
      glow: "shadow-[0_0_30px_-10px_oklch(0.78_0.16_75/0.4)]",
    },
    emerald: {
      bg: "bg-[oklch(0.70_0.20_145/0.1)]",
      border: "border-[oklch(0.70_0.20_145/0.2)]",
      text: "text-[oklch(0.70_0.20_145)]",
      glow: "shadow-[0_0_30px_-10px_oklch(0.70_0.20_145/0.4)]",
    },
    purple: {
      bg: "bg-[oklch(0.65_0.22_265/0.1)]",
      border: "border-[oklch(0.65_0.22_265/0.2)]",
      text: "text-[oklch(0.65_0.22_265)]",
      glow: "shadow-[0_0_30px_-10px_oklch(0.65_0.22_265/0.4)]",
    },
  };

  const colors = accentColors[accentColor];

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), animationDelay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [animationDelay]);

  // Animate number counting
  useEffect(() => {
    if (!isVisible) return;
    if (typeof value !== "number") return;

    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;
    let animationId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(
        startValue + (value - startValue) * easeOutQuart
      );

      setDisplayValue(current);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isVisible, value]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative group",
        "rounded-xl border bg-card/50 backdrop-blur-sm",
        "p-6 transition-all duration-500",
        "hover:bg-card/80",
        colors.glow,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {/* Accent line at top */}
      <div
        className={cn(
          "absolute top-0 left-6 right-6 h-px",
          "bg-gradient-to-r from-transparent via-current to-transparent",
          colors.text,
          "opacity-30"
        )}
      />

      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={cn("p-2 rounded-lg", colors.bg, colors.border, "border")}
          >
            <Icon className={cn("w-4 h-4", colors.text)} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "text-4xl font-bold tracking-tight tabular-nums",
            colors.text
          )}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue}
        </span>
        {suffix && (
          <span className="text-lg text-muted-foreground font-medium">
            {suffix}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}

      {/* Hover glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100",
          "transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-br from-transparent via-transparent",
          accentColor === "cyan" && "to-[oklch(0.75_0.18_195/0.05)]",
          accentColor === "amber" && "to-[oklch(0.78_0.16_75/0.05)]",
          accentColor === "emerald" && "to-[oklch(0.70_0.20_145/0.05)]",
          accentColor === "purple" && "to-[oklch(0.65_0.22_265/0.05)]"
        )}
      />
    </div>
  );
}
