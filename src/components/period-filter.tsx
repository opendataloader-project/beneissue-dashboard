"use client";

import { useEffect, useRef, useState } from "react";
import { endOfDay, format, isValid, parse, startOfDay } from "date-fns";
import { Calendar } from "lucide-react";

import type { DateRange, PeriodFilter } from "@/types/metrics";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

interface PeriodFilterProps {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
  customRange?: DateRange | null;
  onCustomRangeChange?: (range: DateRange | null) => void;
}

const PERIOD_OPTIONS: PeriodFilter[] = [
  "1week",
  "1month",
  "90days",
  "1year",
  "all",
  "custom",
];

export function PeriodFilterSelect({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
}: PeriodFilterProps) {
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const periodLabels: Record<PeriodFilter, string> = {
    "1week": t("oneWeek"),
    "1month": t("oneMonth"),
    "90days": t("ninetyDays"),
    "1year": t("oneYear"),
    all: t("allTime"),
    custom: t("custom"),
  };

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePeriodClick = (period: PeriodFilter) => {
    if (period === "custom") {
      setShowDatePicker(true);
      onChange(period);
    } else {
      setShowDatePicker(false);
      onChange(period);
      onCustomRangeChange?.(null);
    }
  };

  const getDisplayLabel = () => {
    if (value === "custom" && customRange) {
      return `${customRange.startDate} ~ ${customRange.endDate}`;
    }
    return periodLabels[value];
  };

  return (
    <div className="relative" ref={datePickerRef}>
      {/* Button Group Filter */}
      <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border">
        {PERIOD_OPTIONS.map((period) => (
          <Button
            key={period}
            variant={value === period ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePeriodClick(period)}
            className={cn(
              "h-8 px-3 text-sm font-medium transition-all",
              value === period
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {period === "custom" && <Calendar className="w-3.5 h-3.5 mr-1" />}
            {period === "custom" && value === "custom" && customRange
              ? getDisplayLabel()
              : periodLabels[period]}
          </Button>
        ))}
      </div>

      {/* Custom Date Range Picker Dropdown */}
      {showDatePicker && value === "custom" && (
        <DateRangePicker
          value={customRange}
          onChange={(range) => {
            onCustomRangeChange?.(range);
            if (range) {
              setShowDatePicker(false);
            }
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}

interface DateRangePickerProps {
  value: DateRange | null | undefined;
  onChange: (range: DateRange | null) => void;
  onClose: () => void;
}

function DateRangePicker({ value, onChange, onClose }: DateRangePickerProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(value?.startDate || "");
  const [endDate, setEndDate] = useState(value?.endDate || "");
  const [error, setError] = useState<string | null>(null);

  const validateAndApply = () => {
    if (!startDate || !endDate) {
      setError("Please select both dates");
      return;
    }

    const start = parse(startDate, "yyyy-MM-dd", new Date());
    const end = parse(endDate, "yyyy-MM-dd", new Date());

    if (!isValid(start) || !isValid(end)) {
      setError("Invalid date format");
      return;
    }

    if (start > end) {
      setError("Start date must be before end date");
      return;
    }

    setError(null);
    onChange({
      startDate: format(startOfDay(start), "yyyy-MM-dd"),
      endDate: format(endOfDay(end), "yyyy-MM-dd"),
    });
  };

  // Quick select presets
  const presets = [
    { label: t("oneWeek"), days: 7 },
    { label: t("oneMonth"), days: 30 },
    { label: t("ninetyDays"), days: 90 },
  ];

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-4 min-w-[320px]">
      <div className="space-y-4">
        {/* Quick Presets */}
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.days}
              onClick={() => applyPreset(preset.days)}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              End
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={validateAndApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

// Legacy select component (kept for backwards compatibility if needed)
export function PeriodFilterSelectLegacy({
  value,
  onChange,
}: Omit<PeriodFilterProps, "customRange" | "onCustomRangeChange">) {
  const { t } = useTranslation();

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
