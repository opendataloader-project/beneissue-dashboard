"use client";

import { useCallback, useEffect, useState } from "react";
import { mockROIMetrics } from "@/data/mock";
import { dataModeAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";

import type { DateRange, PeriodFilter } from "@/types/metrics";
import type { DeveloperRole, ROIMetrics } from "@/types/roi";

interface UseROIMetricsResult {
  data: ROIMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseROIMetricsParams {
  period: PeriodFilter;
  customRange: DateRange | null;
  repo: string | null;
  developerRole: DeveloperRole;
}

async function fetchROIMetrics(endpoint: string): Promise<ROIMetrics | null> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export function useROIMetrics({
  period,
  customRange,
  repo,
  developerRole,
}: UseROIMetricsParams): UseROIMetricsResult {
  const dataMode = useAtomValue(dataModeAtom);
  const [data, setData] = useState<ROIMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (dataMode === "mock") {
      setData(mockROIMetrics);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = `/api/metrics/roi?period=${period}&role=${developerRole}`;
      if (period === "custom" && customRange) {
        endpoint += `&startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
      }
      if (repo) {
        endpoint += `&repo=${encodeURIComponent(repo)}`;
      }

      const metrics = await fetchROIMetrics(endpoint);
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, period, customRange, repo, developerRole]);

  useEffect(() => {
    if (period === "custom" && !customRange) {
      return;
    }
    refetch();
  }, [refetch, period, customRange]);

  return { data, isLoading, error, refetch };
}
