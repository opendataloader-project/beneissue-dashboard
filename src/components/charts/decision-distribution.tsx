"use client";

import { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { DecisionDistribution } from "@/types/metrics";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface DecisionDistributionChartProps {
  data: DecisionDistribution;
  className?: string;
}

const COLORS = [
  "oklch(0.70 0.20 145)", // Emerald - Valid
  "oklch(0.60 0.20 25)", // Rose - Invalid
  "oklch(0.78 0.16 75)", // Amber - Duplicate
  "oklch(0.65 0.22 265)", // Purple - Needs Info
];

function CustomTooltip({
  active,
  payload,
  labels,
  countUnit,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { fill: string; percent: number };
  }>;
  labels: Record<string, string>;
  countUnit: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];

  return (
    <div className="px-3 py-2 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: item.payload.fill }}
        />
        <span className="text-sm font-medium">{labels[item.name]}</span>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        <span className="tabular-nums">
          {formatNumber(item.value)}
          {countUnit}
        </span>
        <span className="mx-1">·</span>
        <span className="tabular-nums">
          {formatPercent(item.payload.percent * 100)}
        </span>
      </div>
    </div>
  );
}

export function DecisionDistributionChart({
  data,
  className,
}: DecisionDistributionChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    valid: t("valid"),
    invalid: t("invalid"),
    duplicate: t("duplicate"),
    needsInfo: t("needsInfo"),
  };

  const chartData = [
    { name: "valid", value: data.valid },
    { name: "invalid", value: data.invalid },
    { name: "duplicate", value: data.duplicate },
    { name: "needsInfo", value: data.needsInfo },
  ];

  const total = data.valid + data.invalid + data.duplicate + data.needsInfo;
  const filteringRate =
    total > 0 ? ((data.invalid + data.duplicate) / total) * 100 : 0;

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
          {t("decisionDistTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("decisionDistDesc")}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <CustomTooltip labels={labels} countUnit={t("countUnit")} />
              }
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p
              className="text-2xl font-bold text-foreground tabular-nums"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {formatPercent(filteringRate)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("filteringRate")}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.map((item, index) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: COLORS[index] }}
              />
              <span className="text-sm text-muted-foreground truncate">
                {labels[item.name]}
              </span>
              <span className="text-sm font-medium tabular-nums ml-auto">
                {formatPercent(percent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
