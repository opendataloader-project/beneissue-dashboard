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

import type { TrendData } from "@/types/metrics";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface TrendChartProps {
  data: TrendData[];
  className?: string;
  title?: string;
  description?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  autoResolvedLabel,
  manualRequiredLabel,
  autoResolutionRateLabel,
  countUnit,
  language,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; fill?: string; stroke?: string }>;
  label?: string;
  autoResolvedLabel: string;
  manualRequiredLabel: string;
  autoResolutionRateLabel: string;
  countUnit: string;
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

  const autoResolved = payload.find((p) => p.dataKey === "autoResolved");
  const manualRequired = payload.find((p) => p.dataKey === "manualRequired");
  const rate = payload.find((p) => p.dataKey === "autoResolutionRate");

  return (
    <div className="px-4 py-3 rounded-lg border bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <p
        className="text-sm font-semibold mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {formatLabel(label || "")}
      </p>
      <div className="space-y-1.5">
        {autoResolved && (
          <p className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.70_0.15_160)]" />
            <span className="text-muted-foreground">{autoResolvedLabel}:</span>
            <span className="font-medium tabular-nums">
              {formatNumber(autoResolved.value)}{countUnit}
            </span>
          </p>
        )}
        {manualRequired && (
          <p className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.12_260)]" />
            <span className="text-muted-foreground">{manualRequiredLabel}:</span>
            <span className="font-medium tabular-nums">
              {formatNumber(manualRequired.value)}{countUnit}
            </span>
          </p>
        )}
        {rate && (
          <p className="text-sm flex items-center gap-2 pt-1 border-t border-border/50">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_75)]" />
            <span className="text-muted-foreground">{autoResolutionRateLabel}:</span>
            <span className="font-medium tabular-nums">{rate.value}%</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function TrendChart({ data, className, title, description }: TrendChartProps) {
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
      // 12개월 이하일 경우 모든 라벨 표시
      midCount = count <= 12 ? count - 2 : Math.min(10, Math.floor(count / 2) - 1);
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

  // Y축 최대값 계산 (자동해결 + 수동필요)
  const maxTotal = Math.max(...data.map((d) => d.autoResolved + d.manualRequired));

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
          {title || t("trendChartTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {description || t("trendChartDesc")}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 50, left: 0, bottom: 0 }}
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

            {/* 왼쪽 Y축: 건수 */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.60 0.02 260)", fontSize: 12 }}
              dx={-10}
              domain={[0, Math.ceil(maxTotal * 1.1)]}
            />

            {/* 오른쪽 Y축: 자동해결율 (%) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.75 0.18 75)", fontSize: 12 }}
              dx={10}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={
                <CustomTooltip
                  autoResolvedLabel={t("autoResolved")}
                  manualRequiredLabel={t("manualRequired")}
                  autoResolutionRateLabel={t("autoResolutionRate")}
                  countUnit={t("countUnit")}
                  language={language}
                />
              }
              cursor={{ fill: "oklch(0.5 0 0 / 0.1)" }}
            />

            {/* Stacked Bar */}
            <Bar
              yAxisId="left"
              dataKey="autoResolved"
              stackId="stack"
              fill="oklch(0.70 0.15 160)"
              radius={[0, 0, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              yAxisId="left"
              dataKey="manualRequired"
              stackId="stack"
              fill="oklch(0.65 0.12 260)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={200}
            />

            {/* Line: 자동해결율 */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="autoResolutionRate"
              stroke="oklch(0.75 0.18 75)"
              strokeWidth={2}
              dot={{
                fill: "oklch(0.08 0.01 260)",
                stroke: "oklch(0.75 0.18 75)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "oklch(0.75 0.18 75)",
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
          <div className="w-3 h-3 rounded bg-[oklch(0.70_0.15_160)]" />
          <span className="text-sm text-muted-foreground">{t("autoResolved")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[oklch(0.65_0.12_260)]" />
          <span className="text-sm text-muted-foreground">{t("manualRequired")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[oklch(0.75_0.18_75)]" />
          <span className="text-sm text-muted-foreground">{t("autoResolutionRate")}</span>
        </div>
      </div>
    </div>
  );
}
