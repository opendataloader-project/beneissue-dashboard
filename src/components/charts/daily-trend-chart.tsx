'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatDateShort, formatNumber } from '@/lib/format';
import type { DailyData } from '@/types/metrics';

interface DailyTrendChartProps {
  data: DailyData[];
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; fill: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const labels: Record<string, string> = {
    triageCount: '분류',
    analyzeCount: '분석',
    fixCount: '수정',
  };

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
              {formatNumber(item.value)}건
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
        'relative rounded-xl border bg-card/50 backdrop-blur-sm p-6',
        'transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          일별 처리량 추이
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          최근 14일간 워크플로우 단계별 처리량
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
              tick={{ fill: 'oklch(0.60 0.02 260)', fontSize: 11 }}
              dy={10}
              interval={1}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.60 0.02 260)', fontSize: 12 }}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="triageCount"
              name="분류"
              fill="oklch(0.75 0.18 195)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey="analyzeCount"
              name="분석"
              fill="oklch(0.78 0.16 75)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={200}
            />
            <Bar
              dataKey="fixCount"
              name="수정"
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
          { label: '분류', color: 'oklch(0.75 0.18 195)' },
          { label: '분석', color: 'oklch(0.78 0.16 75)' },
          { label: '수정', color: 'oklch(0.70 0.20 145)' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ background: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
