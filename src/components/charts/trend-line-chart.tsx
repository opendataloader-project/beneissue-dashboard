"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyData } from "@/types/metrics";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface TrendLineChartProps {
  data: MonthlyData[];
  className?: string;
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
  processedLabel,
  countUnit,
  language,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  processedLabel: string;
  countUnit: string;
  language: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    if (language === "ko") {
      return `${year}년 ${Number.parseInt(month)}월`;
    }
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border",
        "bg-card/95 backdrop-blur-sm border-border",
        "shadow-xl"
      )}
    >
      <p
        className="text-sm font-semibold mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {label ? formatMonthLabel(label) : ""}
      </p>
      <div className="space-y-1">
        <p className="text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_195)]" />
          <span className="text-muted-foreground">{processedLabel}:</span>
          <span className="font-medium tabular-nums">
            {formatNumber(payload[0]?.value || 0)}
            {countUnit}
          </span>
        </p>
      </div>
    </div>
  );
}

export function TrendLineChart({ data, className }: TrendLineChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();

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

  // Format month for x-axis
  const formatMonthAxis = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    if (language === "ko") {
      return `${Number.parseInt(month)}월`;
    }
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

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
          {t("monthlyTrendTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("monthlyTrendDesc")}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.75 0.18 195)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.75 0.18 195)"
                  stopOpacity={0}
                />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.02 260 / 0.5)"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickFormatter={formatMonthAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              dx={-10}
            />

            <Tooltip
              content={
                <CustomTooltip
                  processedLabel={t("processedLabel")}
                  countUnit={t("countUnit")}
                  language={language}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="issuesProcessed"
              fill="url(#colorIssues)"
              stroke="none"
              animationDuration={1500}
              animationBegin={300}
            />

            <Line
              type="monotone"
              dataKey="issuesProcessed"
              stroke="oklch(0.75 0.18 195)"
              strokeWidth={3}
              dot={{
                fill: "oklch(0.08 0.01 260)",
                stroke: "oklch(0.75 0.18 195)",
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                fill: "oklch(0.75 0.18 195)",
                stroke: "oklch(0.08 0.01 260)",
                strokeWidth: 2,
                r: 7,
                filter: "url(#glow)",
              }}
              animationDuration={1500}
              animationBegin={0}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_195)]" />
          <span className="text-sm text-muted-foreground">
            {t("processedIssues")}
          </span>
        </div>
      </div>
    </div>
  );
}
