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

import type { CostTrendData } from "@/types/metrics";
import { formatCurrencyUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CostTrendChartProps {
  data: CostTrendData[];
  className?: string;
  title?: string;
  description?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  inputCostLabel,
  outputCostLabel,
  totalCostLabel,
  language,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; fill?: string }>;
  label?: string;
  inputCostLabel: string;
  outputCostLabel: string;
  totalCostLabel: string;
  language: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const formatLabel = (periodStr: string) => {
    // 월별 데이터인 경우 (YYYY-MM)
    if (periodStr.length === 7) {
      const [year, month] = periodStr.split("-");
      if (language === "ko") {
        return `${year}년 ${Number.parseInt(month)}월`;
      }
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    }
    // 일별 데이터인 경우 (YYYY-MM-DD)
    const date = new Date(periodStr);
    if (language === "ko") {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const inputCost = payload.find((p) => p.dataKey === "inputCost");
  const outputCost = payload.find((p) => p.dataKey === "outputCost");
  const totalCost =
    (inputCost?.value || 0) + (outputCost?.value || 0);

  return (
    <div className="px-4 py-3 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <p
        className="text-sm font-semibold mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {formatLabel(label || "")}
      </p>
      <div className="space-y-1.5">
        {inputCost && (
          <p className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.70_0.15_160)]" />
            <span className="text-muted-foreground">{inputCostLabel}:</span>
            <span className="font-medium tabular-nums">
              {formatCurrencyUSD(inputCost.value)}
            </span>
          </p>
        )}
        {outputCost && (
          <p className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.78_0.16_75)]" />
            <span className="text-muted-foreground">{outputCostLabel}:</span>
            <span className="font-medium tabular-nums">
              {formatCurrencyUSD(outputCost.value)}
            </span>
          </p>
        )}
        <p className="text-sm flex items-center gap-2 pt-1 border-t border-border/50">
          <span className="w-2 h-2 rounded-full bg-[oklch(0.60_0.02_260)]" />
          <span className="text-muted-foreground">{totalCostLabel}:</span>
          <span className="font-medium tabular-nums">
            {formatCurrencyUSD(totalCost)}
          </span>
        </p>
      </div>
    </div>
  );
}

export function CostTrendChart({ data, className, title, description }: CostTrendChartProps) {
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

  // 월별인지 일별인지 판단
  const isMonthly = data.length > 0 && data[0].period.length === 7;

  // 표시할 tick 계산 (처음과 마지막은 항상 포함, 중간은 동적)
  const getXAxisTicks = () => {
    const count = data.length;
    if (count === 0) return [];
    if (count === 1) return [data[0].period];
    if (count === 2) return [data[0].period, data[1].period];

    const firstPeriod = data[0].period;
    const lastPeriod = data[count - 1].period;

    // 원하는 중간 라벨 개수 결정
    let midCount: number;
    if (isMonthly) {
      midCount = count <= 6 ? count - 2 : Math.min(4, Math.floor(count / 2) - 1);
    } else if (count <= 7) {
      midCount = count - 2;
    } else if (count <= 14) {
      midCount = 5;
    } else if (count <= 31) {
      midCount = 4;
    } else {
      midCount = 4;
    }

    const ticks: string[] = [firstPeriod];

    if (midCount > 0) {
      // 중간 라벨을 균등하게 배치
      const step = (count - 1) / (midCount + 1);
      for (let i = 1; i <= midCount; i++) {
        const idx = Math.round(step * i);
        if (idx > 0 && idx < count - 1) {
          ticks.push(data[idx].period);
        }
      }
    }

    ticks.push(lastPeriod);
    return ticks;
  };

  const formatXAxis = (periodStr: string) => {
    if (isMonthly) {
      const [year, month] = periodStr.split("-");
      if (language === "ko") {
        return `${Number.parseInt(month)}월`;
      }
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "short" });
    }
    // 일별
    const date = new Date(periodStr);
    if (language === "ko") {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
  };

  // Y축 최대값 계산
  const maxTotal = Math.max(...data.map((d) => d.totalCost));

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
          {title || t("costTrendChartTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {description || t("costTrendChartDesc")}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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

            {/* Y축: 비용 ($) */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              dx={-10}
              domain={[0, Math.ceil(maxTotal * 1.1) || 10]}
              tickFormatter={(value) => `$${value}`}
            />

            <Tooltip
              content={
                <CustomTooltip
                  inputCostLabel={t("inputCost")}
                  outputCostLabel={t("outputCost")}
                  totalCostLabel={t("totalCost")}
                  language={language}
                />
              }
              cursor={{ fill: "oklch(0.5 0 0 / 0.1)" }}
            />

            {/* Stacked Bar: Input Cost (하단) */}
            <Bar
              dataKey="inputCost"
              stackId="cost"
              fill="oklch(0.70 0.15 160)"
              radius={[0, 0, 0, 0]}
              animationDuration={1500}
            />
            {/* Stacked Bar: Output Cost (상단) */}
            <Bar
              dataKey="outputCost"
              stackId="cost"
              fill="oklch(0.78 0.16 75)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={200}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[oklch(0.70_0.15_160)]" />
          <span className="text-sm text-muted-foreground">{t("inputCost")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[oklch(0.78_0.16_75)]" />
          <span className="text-sm text-muted-foreground">{t("outputCost")}</span>
        </div>
      </div>
    </div>
  );
}
