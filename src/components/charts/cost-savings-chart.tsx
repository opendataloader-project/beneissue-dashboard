"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyData } from "@/types/metrics";
import { formatCurrencyKRW, formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CostSavingsChartProps {
  data: MonthlyData[];
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="px-4 py-3 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <p
        className="text-sm font-semibold mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {label ? formatMonth(label) : ""}
      </p>
      <div className="space-y-1">
        <p className="text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[oklch(0.78_0.16_75)]" />
          <span className="text-muted-foreground">비용 절감:</span>
          <span className="font-medium tabular-nums">
            {formatCurrencyKRW(payload[0]?.value || 0)}
          </span>
        </p>
      </div>
    </div>
  );
}

export function CostSavingsChart({ data, className }: CostSavingsChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

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
          월별 비용 절감 추이
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          AI 자동화로 절약된 개발 비용
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.78 0.16 75)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.78 0.16 75)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.02 260 / 0.5)"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const [, month] = value.split("-");
                return `${parseInt(month)}월`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="costSavings"
              stroke="oklch(0.78 0.16 75)"
              strokeWidth={3}
              fill="url(#colorSavings)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[oklch(0.78_0.16_75)]" />
          <span className="text-sm text-muted-foreground">비용 절감액</span>
        </div>
      </div>
    </div>
  );
}
