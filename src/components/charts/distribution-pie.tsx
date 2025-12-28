"use client";

import { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ProcessingDistribution } from "@/types/metrics";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DistributionPieProps {
  data: ProcessingDistribution;
  className?: string;
}

const COLORS = [
  "oklch(0.75 0.18 195)", // Cyan - Triage
  "oklch(0.78 0.16 75)", // Amber - Analyze
  "oklch(0.70 0.20 145)", // Emerald - Fix
];

const LABELS = {
  triage: "분류",
  analyze: "분석",
  fix: "수정",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
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
        <span className="text-sm font-medium">
          {LABELS[item.name as keyof typeof LABELS]}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatNumber(item.value)}건
        </span>
      </div>
    </div>
  );
}

export function DistributionPie({ data, className }: DistributionPieProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = [
    { name: "triage", value: data.triage },
    { name: "analyze", value: data.analyze },
    { name: "fix", value: data.fix },
  ];

  const total = data.triage + data.analyze + data.fix;

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
          AI 처리 분포
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          워크플로우 단계별 처리량
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
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
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
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p
              className="text-3xl font-bold text-foreground tabular-nums"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {formatNumber(total)}
            </p>
            <p className="text-xs text-muted-foreground">총 처리</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[index] }}
            />
            <span className="text-sm text-muted-foreground">
              {LABELS[item.name as keyof typeof LABELS]}
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
