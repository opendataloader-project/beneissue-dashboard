"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import type { DateRange, PeriodFilter } from "@/types/metrics";

const periodOptions = [
  "1week",
  "1month",
  "90days",
  "1year",
  "all",
  "custom",
] as const;

export function useDashboardSearchParams() {
  const [params, setParams] = useQueryStates({
    period: parseAsStringLiteral(periodOptions).withDefault("1year"),
    repo: parseAsString,
    startDate: parseAsString,
    endDate: parseAsString,
  });

  const setPeriod = (period: PeriodFilter) => {
    if (period !== "custom") {
      // Reset date range if not custom
      setParams({ period, startDate: null, endDate: null });
    } else {
      setParams({ period });
    }
  };

  const setRepo = (repo: string | null) => {
    setParams({ repo });
  };

  const setCustomRange = (range: DateRange | null) => {
    if (range) {
      setParams({ startDate: range.startDate, endDate: range.endDate });
    } else {
      setParams({ startDate: null, endDate: null });
    }
  };

  const customRange: DateRange | null =
    params.startDate && params.endDate
      ? { startDate: params.startDate, endDate: params.endDate }
      : null;

  return {
    period: params.period as PeriodFilter,
    repo: params.repo,
    customRange,
    setPeriod,
    setRepo,
    setCustomRange,
  };
}
