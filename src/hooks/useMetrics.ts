import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import type {
  PublicMetrics,
  ExecutiveMetrics,
  OperationsMetrics,
  DashboardMetrics,
  PeriodFilter,
} from '@/types/metrics';
import {
  mockPublicMetrics,
  mockExecutiveMetrics,
  mockOperationsMetrics,
  mockDashboardMetrics,
} from '@/data/mock';
import { dataModeAtom } from '@/store/atoms';

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
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
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
  const [data, setData] = useState<PublicMetrics | null>(mockPublicMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (dataMode === 'mock') {
      setData(mockPublicMetrics);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<PublicMetrics>('/api/metrics/public');
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [dataMode]);

  return { data, isLoading, error, refetch };
}

export function useExecutiveMetrics(): UseMetricsResult<ExecutiveMetrics> {
  const dataMode = useAtomValue(dataModeAtom);
  const [data, setData] = useState<ExecutiveMetrics | null>(mockExecutiveMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (dataMode === 'mock') {
      setData(mockExecutiveMetrics);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<ExecutiveMetrics>('/api/metrics/executive');
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [dataMode]);

  return { data, isLoading, error, refetch };
}

export function useOperationsMetrics(): UseMetricsResult<OperationsMetrics> {
  const dataMode = useAtomValue(dataModeAtom);
  const [data, setData] = useState<OperationsMetrics | null>(mockOperationsMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (dataMode === 'mock') {
      setData(mockOperationsMetrics);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<OperationsMetrics>('/api/metrics/operations');
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [dataMode]);

  return { data, isLoading, error, refetch };
}

interface UseDashboardMetricsResult extends UseMetricsResult<DashboardMetrics> {
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
}

export function useDashboardMetrics(): UseDashboardMetricsResult {
  const dataMode = useAtomValue(dataModeAtom);
  const [data, setData] = useState<DashboardMetrics | null>(mockDashboardMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('this_month');

  const refetch = async () => {
    if (dataMode === 'mock') {
      setData(mockDashboardMetrics);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<DashboardMetrics>(`/api/metrics/dashboard?period=${period}`);
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [dataMode, period]);

  return { data, isLoading, error, refetch, period, setPeriod };
}
