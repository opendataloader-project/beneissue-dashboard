'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon?: LucideIcon;
  description?: string;
  accentColor?: 'teal' | 'amber' | 'green' | 'purple';
  animationDelay?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  description,
  accentColor = 'teal',
  animationDelay = 0,
  className,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);
  const cardRef = useRef<HTMLDivElement>(null);

  // Light theme accent color mapping
  const accentColors = {
    teal: {
      bg: 'bg-[oklch(0.45_0.12_200/0.08)]',
      border: 'border-[oklch(0.45_0.12_200/0.15)]',
      text: 'text-[oklch(0.40_0.12_200)]',
    },
    amber: {
      bg: 'bg-[oklch(0.72_0.14_70/0.12)]',
      border: 'border-[oklch(0.72_0.14_70/0.2)]',
      text: 'text-[oklch(0.55_0.14_70)]',
    },
    green: {
      bg: 'bg-[oklch(0.50_0.14_155/0.1)]',
      border: 'border-[oklch(0.50_0.14_155/0.15)]',
      text: 'text-[oklch(0.45_0.14_155)]',
    },
    purple: {
      bg: 'bg-[oklch(0.48_0.10_280/0.1)]',
      border: 'border-[oklch(0.48_0.10_280/0.15)]',
      text: 'text-[oklch(0.45_0.10_280)]',
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
    if (!isVisible || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(startValue + (value - startValue) * easeOutQuart);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative group',
        'rounded-xl border bg-card',
        'p-6 transition-all duration-300',
        'shadow-[0_1px_2px_oklch(0.20_0.02_250/0.04),0_4px_16px_oklch(0.20_0.02_250/0.06)]',
        'hover:shadow-[0_4px_6px_oklch(0.20_0.02_250/0.06),0_12px_32px_oklch(0.20_0.02_250/0.10)]',
        'hover:-translate-y-0.5',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4',
        className
      )}
    >
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl',
              colors.bg,
              colors.border,
              'border'
            )}
          >
            <Icon className={cn('w-5 h-5', colors.text)} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'text-4xl font-bold tracking-tight tabular-nums text-foreground'
          )}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {typeof displayValue === 'number'
            ? displayValue.toLocaleString()
            : displayValue}
        </span>
        {suffix && (
          <span className={cn('text-lg font-semibold', colors.text)}>
            {suffix}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-3 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
