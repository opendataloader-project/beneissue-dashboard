"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SavingsBreakdownData } from "@/types/roi";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface ROIBreakdownChartProps {
  data: SavingsBreakdownData[];
  className?: string;
}

function formatUSD(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(2);
}

function CustomTooltip({
  active,
  payload,
  label,
  language,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: SavingsBreakdownData }>;
  label?: string;
  language: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const spLabel = language === "ko" ? "스토리 포인트" : "Story Points";
  const issuesLabel = language === "ko" ? "처리 이슈" : "Issues";
  const hoursLabel = language === "ko" ? "예상 시간" : "Estimated Hours";
  const savingsLabel = language === "ko" ? "절감액" : "Savings";
  const percentLabel = language === "ko" ? "비율" : "Share";

  return (
    <div className="px-4 py-3 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <p className="text-sm font-semibold mb-2">
        {spLabel}: {data.storyPoints}
      </p>
      <div className="space-y-1.5 text-sm">
        <p className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{issuesLabel}:</span>
          <span className="font-medium tabular-nums">
            {data.issueCount}
            {language === "ko" ? "건" : ""}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{hoursLabel}:</span>
          <span className="font-medium tabular-nums">{data.totalHours}h</span>
        </p>
        <p className="flex items-center justify-between gap-4 pt-1 border-t border-border/50">
          <span className="text-muted-foreground">{savingsLabel}:</span>
          <span className="font-medium tabular-nums text-emerald-400">
            ${formatUSD(data.totalSavings)}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{percentLabel}:</span>
          <span className="font-medium tabular-nums">{data.percentage}%</span>
        </p>
      </div>
    </div>
  );
}

export function ROIBreakdownChart({ data, className }: ROIBreakdownChartProps) {
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

  // Transform data for chart
  const chartData = data.map((item) => ({
    ...item,
    label: `${item.storyPoints} SP`,
  }));

  const maxSavings = Math.max(...data.map((d) => d.totalSavings));

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
        <h3 className="text-lg font-semibold">{t("savingsBreakdown")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("savingsBreakdownDesc")}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.02 260 / 0.5)"
              horizontal={false}
            />

            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              tickFormatter={(value) => `$${formatUSD(value)}`}
              domain={[0, Math.ceil(maxSavings * 1.1)]}
            />

            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              width={50}
            />

            <Tooltip
              content={<CustomTooltip language={language} />}
              cursor={{ fill: "oklch(0.5 0 0 / 0.1)" }}
            />

            <Bar
              dataKey="totalSavings"
              fill="oklch(0.70 0.20 145)"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
        {data.map((item) => (
          <div
            key={item.storyPoints}
            className="px-3 py-2 rounded-lg bg-muted/30"
          >
            <p className="text-xs text-muted-foreground">
              {item.storyPoints} SP
            </p>
            <p className="text-sm font-medium tabular-nums">
              {item.percentage.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
