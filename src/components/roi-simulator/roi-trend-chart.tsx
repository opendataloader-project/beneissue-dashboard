"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ROITrendData } from "@/types/roi";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface ROITrendChartProps {
  data: ROITrendData[];
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
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  language: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const formatLabel = (periodStr: string) => {
    if (periodStr.length === 7) {
      const [year, month] = periodStr.split("-");
      if (language === "ko") {
        return `${year}년 ${Number.parseInt(month)}월`;
      }
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    }
    const date = new Date(periodStr);
    if (language === "ko") {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const savings = payload.find((p) => p.dataKey === "humanCostSaved");
  const aiCost = payload.find((p) => p.dataKey === "aiCost");
  const netSavings = payload.find((p) => p.dataKey === "netSavings");
  const roi = payload.find((p) => p.dataKey === "roiPercentage");

  const savingsLabel = language === "ko" ? "비용 절감" : "Cost Saved";
  const aiCostLabel = language === "ko" ? "AI 비용" : "AI Cost";
  const netLabel = language === "ko" ? "순 절감" : "Net Savings";
  const roiLabel = "ROI";

  return (
    <div className="px-4 py-3 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <p className="text-sm font-semibold mb-2">{formatLabel(label || "")}</p>
      <div className="space-y-1.5 text-sm">
        {savings && (
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.70_0.20_145)]" />
            <span className="text-muted-foreground">{savingsLabel}:</span>
            <span className="font-medium tabular-nums">${formatUSD(savings.value)}</span>
          </p>
        )}
        {aiCost && (
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.78_0.16_75)]" />
            <span className="text-muted-foreground">{aiCostLabel}:</span>
            <span className="font-medium tabular-nums">${formatUSD(aiCost.value)}</span>
          </p>
        )}
        {netSavings && (
          <p className="flex items-center gap-2 pt-1 border-t border-border/50">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_195)]" />
            <span className="text-muted-foreground">{netLabel}:</span>
            <span className="font-medium tabular-nums text-emerald-400">
              ${formatUSD(netSavings.value)}
            </span>
          </p>
        )}
        {roi && (
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.22_265)]" />
            <span className="text-muted-foreground">{roiLabel}:</span>
            <span className="font-medium tabular-nums">{roi.value.toLocaleString()}%</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function ROITrendChart({ data, className }: ROITrendChartProps) {
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

  // Filter out months with no data
  const filteredData = data.filter((d) => d.issueCount > 0);

  const getXAxisTicks = () => {
    const count = filteredData.length;
    if (count === 0) return [];
    if (count <= 12) return filteredData.map((d) => d.period);

    const ticks: string[] = [filteredData[0].period];
    const step = Math.floor(count / 6);
    for (let i = step; i < count - 1; i += step) {
      ticks.push(filteredData[i].period);
    }
    ticks.push(filteredData[count - 1].period);
    return ticks;
  };

  const formatXAxis = (periodStr: string) => {
    const [year, month] = periodStr.split("-");
    if (language === "ko") {
      return `${Number.parseInt(month)}월`;
    }
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  const maxCost = Math.max(
    ...filteredData.map((d) => Math.max(d.humanCostSaved, d.aiCost * 100))
  );

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
        <h3 className="text-lg font-semibold">{t("roiTrend")}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t("roiTrendDesc")}</p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 10, right: 60, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.02 260 / 0.5)"
              vertical={false}
            />

            <XAxis
              dataKey="period"
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 11 }}
              dy={10}
              ticks={getXAxisTicks()}
            />

            {/* Left Y-axis: Cost in USD */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              dx={-10}
              tickFormatter={(value) => `$${formatUSD(value)}`}
              domain={[0, Math.ceil(maxCost * 1.1)]}
            />

            {/* Right Y-axis: ROI % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.22 265)", fontSize: 12 }}
              dx={10}
              tickFormatter={(value) => `${value.toLocaleString()}%`}
            />

            <Tooltip
              content={<CustomTooltip language={language} />}
              cursor={{ fill: "oklch(0.5 0 0 / 0.1)" }}
            />

            {/* Bar: Cost Saved */}
            <Bar
              yAxisId="left"
              dataKey="humanCostSaved"
              fill="oklch(0.70 0.20 145)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />

            {/* Line: ROI % */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roiPercentage"
              stroke="oklch(0.65 0.22 265)"
              strokeWidth={2}
              dot={{
                fill: "oklch(0.08 0.01 260)",
                stroke: "oklch(0.65 0.22 265)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "oklch(0.65 0.22 265)",
                stroke: "oklch(0.08 0.01 260)",
                strokeWidth: 2,
                r: 6,
              }}
              animationDuration={1500}
              animationBegin={400}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[oklch(0.70_0.20_145)]" />
          <span className="text-sm text-muted-foreground">{t("costSaved")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[oklch(0.65_0.22_265)]" />
          <span className="text-sm text-muted-foreground">ROI %</span>
        </div>
      </div>
    </div>
  );
}
