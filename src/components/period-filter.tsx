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

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: "today", label: t("today") },
    { value: "this_week", label: t("thisWeek") },
    { value: "this_month", label: t("thisMonth") },
    { value: "last_90_days", label: t("last90Days") },
    { value: "last_year", label: t("lastYear") },
    { value: "all", label: t("all") },
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
