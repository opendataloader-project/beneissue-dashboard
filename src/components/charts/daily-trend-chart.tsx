"use client";

import { useEffect, useRef, useState } from "react";
import type { TranslationKey } from "@/i18n/translations";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyData } from "@/types/metrics";
import { formatDateShort, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface DailyTrendChartProps {
  data: DailyData[];
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  labels,
  countUnit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; fill: string }>;
  label?: string;
  labels: Record<string, string>;
  countUnit: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="px-4 py-3 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <p
        className="text-sm font-semibold mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((item) => (
          <p key={item.dataKey} className="text-sm flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: item.fill }}
            />
            <span className="text-muted-foreground">
              {labels[item.dataKey]}:
            </span>
            <span className="font-medium tabular-nums">
              {formatNumber(item.value)}
              {countUnit}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function DailyTrendChart({ data, className }: DailyTrendChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    triageCount: t("triage"),
    analyzeCount: t("analyze"),
    fixCount: t("fix"),
  };

  // Transform data for chart
  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDateShort(item.date),
  }));

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
          {t("dailyTrendTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dailyTrendDesc")}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.02 260 / 0.5)"
              vertical={false}
            />

            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 11 }}
              dy={10}
              interval={1}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              dx={-10}
            />

            <Tooltip
              content={
                <CustomTooltip labels={labels} countUnit={t("countUnit")} />
              }
              cursor={{ fill: "oklch(0.5 0 0 / 0.1)" }}
            />

            <Bar
              dataKey="triageCount"
              name={t("triage")}
              fill="oklch(0.75 0.18 195)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey="analyzeCount"
              name={t("analyze")}
              fill="oklch(0.78 0.16 75)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={200}
            />
            <Bar
              dataKey="fixCount"
              name={t("fix")}
              fill="oklch(0.70 0.20 145)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {[
          { key: "triage" as TranslationKey, color: "oklch(0.75 0.18 195)" },
          { key: "analyze" as TranslationKey, color: "oklch(0.78 0.16 75)" },
          { key: "fix" as TranslationKey, color: "oklch(0.70 0.20 145)" },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ background: item.color }}
            />
            <span className="text-sm text-muted-foreground">{t(item.key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
