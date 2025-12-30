"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import type { DateRange, PeriodFilter } from "@/types/metrics";
import type { DeveloperRole } from "@/types/roi";

const periodOptions = [
  "1week",
  "1month",
  "90days",
  "1year",
  "all",
  "custom",
] as const;

const developerRoleOptions = [
  "application_developer",
  "system_developer",
  "it_pm",
  "it_architect",
  "data_analyst",
] as const;

export function useROISearchParams() {
  const [params, setParams] = useQueryStates({
    period: parseAsStringLiteral(periodOptions).withDefault("1year"),
    repo: parseAsString,
    startDate: parseAsString,
    endDate: parseAsString,
    role: parseAsStringLiteral(developerRoleOptions).withDefault(
      "application_developer"
    ),
  });

  const setPeriod = (period: PeriodFilter) => {
    if (period !== "custom") {
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

  const setDeveloperRole = (role: DeveloperRole) => {
    setParams({ role });
  };

  const customRange: DateRange | null =
    params.startDate && params.endDate
      ? { startDate: params.startDate, endDate: params.endDate }
      : null;

  return {
    period: params.period as PeriodFilter,
    repo: params.repo,
    customRange,
    developerRole: params.role as DeveloperRole,
    setPeriod,
    setRepo,
    setCustomRange,
    setDeveloperRole,
  };
}
