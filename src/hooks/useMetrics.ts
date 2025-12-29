import { useCallback, useEffect, useState } from "react";
import { mockDashboardMetrics, mockPublicMetrics } from "@/data/mock";
import { dataModeAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";

import type { DashboardMetrics, DateRange, PeriodFilter, PublicMetrics } from "@/types/metrics";

interface UseMetricsResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function fetchMetrics<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    // API가 빈 데이터를 반환하면 null 처리
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export function usePublicMetrics(): UseMetricsResult<PublicMetrics> {
  const dataMode = useAtomValue(dataModeAtom);
  // 초기 상태는 null로 설정하여 Live 모드에서 mock 데이터가 보이지 않도록 함
  const [data, setData] = useState<PublicMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (dataMode === "mock") {
      setData(mockPublicMetrics);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<PublicMetrics>("/api/metrics/public");
      // Live 모드에서 API가 null을 반환해도 mock으로 fallback하지 않음
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [dataMode]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

interface UseDashboardMetricsResult extends UseMetricsResult<DashboardMetrics> {
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  customRange: DateRange | null;
  setCustomRange: (range: DateRange | null) => void;
}

export function useDashboardMetrics(): UseDashboardMetricsResult {
  const dataMode = useAtomValue(dataModeAtom);
  // 초기 상태는 null로 설정하여 Live 모드에서 mock 데이터가 보이지 않도록 함
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>("1month");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  const refetch = useCallback(async () => {
    if (dataMode === "mock") {
      setData(mockDashboardMetrics);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Build query params
      let endpoint = `/api/metrics/dashboard?period=${period}`;
      if (period === "custom" && customRange) {
        endpoint += `&startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
      }
      const metrics = await fetchMetrics<DashboardMetrics>(endpoint);
      // Live 모드에서 API가 null을 반환해도 mock으로 fallback하지 않음
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, period, customRange]);

  useEffect(() => {
    // Only refetch for custom if we have a valid range
    if (period === "custom" && !customRange) {
      return;
    }
    refetch();
  }, [refetch, period, customRange]);

  return { data, isLoading, error, refetch, period, setPeriod, customRange, setCustomRange };
}
