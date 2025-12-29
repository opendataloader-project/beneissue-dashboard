"use client";

import { Calendar } from "lucide-react";

import type { PeriodFilter } from "@/types/metrics";
import { useTranslation } from "@/hooks/useTranslation";

interface PeriodFilterProps {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}

export function PeriodFilterSelect({ value, onChange }: PeriodFilterProps) {
  const { t } = useTranslation();

  // 기획서 기간 필터: 1주, 1달, 90일, 1년, 전체
  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: "1week", label: t("oneWeek") },
    { value: "1month", label: t("oneMonth") },
    { value: "90days", label: t("ninetyDays") },
    { value: "1year", label: t("oneYear") },
    { value: "all", label: t("allTime") },
  ];

  return (
    <div className="relative inline-flex items-center">
      <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PeriodFilter)}
        className="pl-9 pr-8 py-2 text-sm bg-background border border-border rounded-lg appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 w-4 h-4 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}
