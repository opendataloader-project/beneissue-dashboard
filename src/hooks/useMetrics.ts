import { useCallback, useEffect, useState } from "react";
import { mockDashboardMetrics, mockPublicMetrics } from "@/data/mock";
import { dataModeAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";

import type {
  DashboardMetrics,
  DateRange,
  PeriodFilter,
  PublicMetrics,
} from "@/types/metrics";

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
    // Return null if API returns empty data
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
  // Initialize state as null to prevent mock data from showing in Live mode
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
      // Do not fallback to mock even if API returns null in Live mode
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

interface UseDashboardMetricsParams {
  period: PeriodFilter;
  customRange: DateRange | null;
  repo: string | null;
}

export function useDashboardMetrics({
  period,
  customRange,
  repo,
}: UseDashboardMetricsParams): UseMetricsResult<DashboardMetrics> {
  const dataMode = useAtomValue(dataModeAtom);
  // Initialize state as null to prevent mock data from showing in Live mode
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      if (repo) {
        endpoint += `&repo=${encodeURIComponent(repo)}`;
      }
      const metrics = await fetchMetrics<DashboardMetrics>(endpoint);
      // Do not fallback to mock even if API returns null in Live mode
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, period, customRange, repo]);

  useEffect(() => {
    // Only refetch for custom if we have a valid range
    if (period === "custom" && !customRange) {
      return;
    }
    refetch();
  }, [refetch, period, customRange]);

  return { data, isLoading, error, refetch };
}

export function useRepos() {
  const dataMode = useAtomValue(dataModeAtom);
  const [repos, setRepos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dataMode === "mock") {
      // Mock repos for demo
      setRepos(["owner/repo-1", "owner/repo-2", "owner/repo-3"]);
      setIsLoading(false);
      return;
    }

    async function fetchRepos() {
      try {
        const res = await fetch("/api/repos");
        if (res.ok) {
          const data = await res.json();
          setRepos(data);
        }
      } catch (error) {
        console.error("Error fetching repos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepos();
  }, [dataMode]);

  return { repos, isLoading };
}
