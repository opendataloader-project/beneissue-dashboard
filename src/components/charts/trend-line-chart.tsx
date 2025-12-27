'use client';

import { useEffect, useState, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatMonth, formatNumber } from '@/lib/format';
import type { MonthlyData } from '@/types/metrics';

interface TrendLineChartProps {
  data: MonthlyData[];
  className?: string;
}

// Custom tooltip component
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
    <div
      className={cn(
        'px-4 py-3 rounded-lg border',
        'bg-card/95 backdrop-blur-sm border-border',
        'shadow-xl'
      )}
    >
      <p
        className="text-sm font-semibold mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {label ? formatMonth(label) : ''}
      </p>
      <div className="space-y-1">
        <p className="text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_195)]" />
          <span className="text-muted-foreground">처리량:</span>
          <span className="font-medium tabular-nums">
            {formatNumber(payload[0]?.value || 0)}건
          </span>
        </p>
      </div>
    </div>
  );
}

export function TrendLineChart({ data, className }: TrendLineChartProps) {
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

  // Transform data for chart
  const chartData = data.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

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
          월별 처리량 추이
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          최근 6개월간 AI가 처리한 이슈 수
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
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
              stroke="oklch(0.80 0.01 260 / 0.6)"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const [, month] = value.split('-');
                return `${parseInt(month)}월`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.60 0.02 260)', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.60 0.02 260)', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

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
                fill: 'oklch(1 0 0)',
                stroke: 'oklch(0.75 0.18 195)',
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                fill: 'oklch(0.75 0.18 195)',
                stroke: 'oklch(1 0 0)',
                strokeWidth: 2,
                r: 7,
                filter: 'url(#glow)',
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
          <span className="text-sm text-muted-foreground">처리된 이슈</span>
        </div>
      </div>
    </div>
  );
}
