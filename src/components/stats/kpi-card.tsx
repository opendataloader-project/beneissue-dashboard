'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  suffix?: string;
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  invertDelta?: boolean; // For metrics where lower is better (e.g., response time)
  icon?: LucideIcon;
  accentColor?: 'cyan' | 'amber' | 'emerald' | 'purple';
  animationDelay?: number;
  className?: string;
}

export function KPICard({
  title,
  value,
  suffix,
  subtitle,
  delta,
  deltaLabel = '전월 대비',
  invertDelta = false,
  icon: Icon,
  accentColor = 'cyan',
  animationDelay = 0,
  className,
}: KPICardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === 'number' ? 0 : value
  );
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine trend (inverted for metrics where lower is better)
  const rawTrend = delta === undefined ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  const trend = invertDelta
    ? rawTrend === 'up' ? 'down' : rawTrend === 'down' ? 'up' : 'neutral'
    : rawTrend;
  const TrendIcon = rawTrend === 'up' ? TrendingUp : rawTrend === 'down' ? TrendingDown : Minus;

  // Accent color mapping
  const accentColors = {
    cyan: {
      bg: 'bg-[oklch(0.75_0.18_195/0.1)]',
      border: 'border-[oklch(0.75_0.18_195/0.2)]',
      text: 'text-[oklch(0.75_0.18_195)]',
      glow: 'shadow-[0_0_40px_-10px_oklch(0.75_0.18_195/0.3)]',
    },
    amber: {
      bg: 'bg-[oklch(0.78_0.16_75/0.1)]',
      border: 'border-[oklch(0.78_0.16_75/0.2)]',
      text: 'text-[oklch(0.78_0.16_75)]',
      glow: 'shadow-[0_0_40px_-10px_oklch(0.78_0.16_75/0.3)]',
    },
    emerald: {
      bg: 'bg-[oklch(0.70_0.20_145/0.1)]',
      border: 'border-[oklch(0.70_0.20_145/0.2)]',
      text: 'text-[oklch(0.70_0.20_145)]',
      glow: 'shadow-[0_0_40px_-10px_oklch(0.70_0.20_145/0.3)]',
    },
    purple: {
      bg: 'bg-[oklch(0.65_0.22_265/0.1)]',
      border: 'border-[oklch(0.65_0.22_265/0.2)]',
      text: 'text-[oklch(0.65_0.22_265)]',
      glow: 'shadow-[0_0_40px_-10px_oklch(0.65_0.22_265/0.3)]',
    },
  };

  const colors = accentColors[accentColor];

  // Trend colors
  const trendColors = {
    up: 'text-emerald-400 bg-emerald-400/10',
    down: 'text-rose-400 bg-rose-400/10',
    neutral: 'text-muted-foreground bg-muted/50',
  };

  // Intersection observer
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

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(value * easeOutQuart);

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
        'rounded-xl border bg-card/50 backdrop-blur-sm',
        'p-6 transition-all duration-500',
        'hover:bg-card/80',
        colors.glow,
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {/* Top accent line */}
      <div
        className={cn(
          'absolute top-0 left-6 right-6 h-px',
          'bg-gradient-to-r from-transparent via-current to-transparent',
          colors.text,
          'opacity-40'
        )}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2 rounded-lg border', colors.bg, colors.border)}>
            <Icon className={cn('w-4 h-4', colors.text)} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className={cn('text-4xl font-bold tracking-tight tabular-nums', colors.text)}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {typeof displayValue === 'number'
            ? displayValue.toLocaleString()
            : displayValue}
        </span>
        {suffix && (
          <span className="text-lg text-muted-foreground font-medium">{suffix}</span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      )}

      {!subtitle && <div className="mb-2" />}

      {/* Delta indicator */}
      {delta !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
              trendColors[trend]
            )}
          >
            <TrendIcon className="w-3 h-3" />
            <span className="tabular-nums">
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{deltaLabel}</span>
        </div>
      )}

      {/* Hover effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100',
          'transition-opacity duration-500 pointer-events-none',
          'bg-gradient-to-br from-transparent via-transparent',
          accentColor === 'cyan' && 'to-[oklch(0.75_0.18_195/0.05)]',
          accentColor === 'amber' && 'to-[oklch(0.78_0.16_75/0.05)]',
          accentColor === 'emerald' && 'to-[oklch(0.70_0.20_145/0.05)]',
          accentColor === 'purple' && 'to-[oklch(0.65_0.22_265/0.05)]'
        )}
      />
    </div>
  );
}
