"use client";

import { useEffect, useRef, useState } from "react";

import type { ResolutionDistribution } from "@/types/metrics";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface ResolutionDistributionChartProps {
  data: ResolutionDistribution;
  className?: string;
}

export function ResolutionDistributionChart({
  data,
  className,
}: ResolutionDistributionChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const total = data.autoResolved + data.manualRequired;
  const autoResolvedPercent = total > 0 ? (data.autoResolved / total) * 100 : 0;
  const manualRequiredPercent = total > 0 ? (data.manualRequired / total) * 100 : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={chartRef}
      className={cn(
        "relative rounded-xl border bg-card/50 backdrop-blur-sm p-6",
        "transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {t("resolutionDistTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("resolutionDistDesc")}
        </p>
      </div>

      {/* Distribution Bar */}
      <div className="space-y-6">
        {/* Main Bar */}
        <div className="relative h-12 rounded-lg overflow-hidden bg-muted/30">
          {/* Auto Resolved */}
          <div
            className="absolute inset-y-0 left-0 bg-[oklch(0.70_0.15_160)] transition-all duration-1000 ease-out"
            style={{
              width: isVisible ? `${autoResolvedPercent}%` : "0%",
            }}
          />
          {/* Manual Required */}
          <div
            className="absolute inset-y-0 bg-[oklch(0.65_0.12_260)] transition-all duration-1000 ease-out delay-200"
            style={{
              left: isVisible ? `${autoResolvedPercent}%` : "100%",
              width: isVisible ? `${manualRequiredPercent}%` : "0%",
            }}
          />

          {/* Labels on bar */}
          {autoResolvedPercent > 15 && (
            <div
              className="absolute inset-y-0 flex items-center justify-center text-white font-semibold text-sm transition-opacity duration-500"
              style={{
                left: 0,
                width: `${autoResolvedPercent}%`,
                opacity: isVisible ? 1 : 0,
              }}
            >
              {formatPercent(autoResolvedPercent)}
            </div>
          )}
          {manualRequiredPercent > 15 && (
            <div
              className="absolute inset-y-0 flex items-center justify-center text-white font-semibold text-sm transition-opacity duration-500 delay-300"
              style={{
                left: `${autoResolvedPercent}%`,
                width: `${manualRequiredPercent}%`,
                opacity: isVisible ? 1 : 0,
              }}
            >
              {formatPercent(manualRequiredPercent)}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Auto Resolved */}
          <div className="p-4 rounded-lg border bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded bg-[oklch(0.70_0.15_160)]" />
              <span className="text-sm text-muted-foreground">{t("autoResolved")}</span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                color: "oklch(0.70 0.15 160)",
              }}
            >
              {formatNumber(data.autoResolved)}{t("countUnit")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatPercent(autoResolvedPercent)}
            </p>
          </div>

          {/* Manual Required */}
          <div className="p-4 rounded-lg border bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded bg-[oklch(0.65_0.12_260)]" />
              <span className="text-sm text-muted-foreground">{t("manualRequired")}</span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                color: "oklch(0.65 0.12 260)",
              }}
            >
              {formatNumber(data.manualRequired)}{t("countUnit")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatPercent(manualRequiredPercent)}
            </p>
          </div>
        </div>

        {/* Investor Message */}
        <div className="p-4 rounded-lg bg-[oklch(0.70_0.15_160_/_0.1)] border border-[oklch(0.70_0.15_160_/_0.2)]">
          <p className="text-sm text-center">
            <span className="font-semibold" style={{ color: "oklch(0.70 0.15 160)" }}>
              {formatPercent(autoResolvedPercent)}
            </span>
            <span className="text-muted-foreground ml-1">
              {t("autoResolvedMessage")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
