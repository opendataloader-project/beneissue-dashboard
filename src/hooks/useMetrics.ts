import { useState, useEffect } from 'react';
import type {
  PublicMetrics,
  ExecutiveMetrics,
  OperationsMetrics,
} from '@/types/metrics';
import {
  mockPublicMetrics,
  mockExecutiveMetrics,
  mockOperationsMetrics,
} from '@/data/mock';

interface UseMetricsResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function fetchMetrics<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return fallback;
  }
}

export function usePublicMetrics(): UseMetricsResult<PublicMetrics> {
  const [data, setData] = useState<PublicMetrics>(mockPublicMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<PublicMetrics>(
        '/api/metrics/public',
        mockPublicMetrics
      );
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}

export function useExecutiveMetrics(): UseMetricsResult<ExecutiveMetrics> {
  const [data, setData] = useState<ExecutiveMetrics>(mockExecutiveMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<ExecutiveMetrics>(
        '/api/metrics/executive',
        mockExecutiveMetrics
      );
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}

export function useOperationsMetrics(): UseMetricsResult<OperationsMetrics> {
  const [data, setData] = useState<OperationsMetrics>(mockOperationsMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetrics<OperationsMetrics>(
        '/api/metrics/operations',
        mockOperationsMetrics
      );
      setData(metrics);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}
