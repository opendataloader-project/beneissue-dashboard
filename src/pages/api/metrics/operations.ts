import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchDailyMetrics,
  fetchTotalMetrics,
  fetchMonthlyAggregates,
  fetchProcessingTimes,
} from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  calculateAIFilteringRate,
  calculateAutoResolutionRate,
  calculateDelta,
} from '@/lib/metrics';
import { mockOperationsMetrics } from '@/data/mock';
import type { OperationsMetrics, DailyData } from '@/types/metrics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OperationsMetrics>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Use mock data if Supabase is not configured
  if (!isSupabaseConfigured) {
    return res.status(200).json(mockOperationsMetrics);
  }

  try {
    // Fetch data for last 14 days
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const startDate = twoWeeksAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    // Current month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Previous month
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;

    const [
      dailyMetrics,
      currentMonthData,
      previousMonthData,
      processingTimes,
    ] = await Promise.all([
      fetchDailyMetrics(startDate, endDate),
      fetchMonthlyAggregates(currentYear, currentMonth),
      fetchMonthlyAggregates(prevYear, prevMonth),
      fetchProcessingTimes(),
    ]);

    // Fallback to mock if no data
    if (!currentMonthData) {
      return res.status(200).json(mockOperationsMetrics);
    }

    // Transform daily data
    const dailyTrend: DailyData[] = dailyMetrics.map((d) => {
      const totalIssues = d.total_issues || 1;
      const invalidCount = totalIssues - (d.valid_count || 0);
      const filteringRate = calculateAIFilteringRate(
        invalidCount,
        d.duplicate_count || 0,
        totalIssues
      );

      return {
        date: d.date,
        triageCount: d.triage_count || 0,
        analyzeCount: d.analyze_count || 0,
        fixCount: d.fix_count || 0,
        filteringRate: Math.round(filteringRate * 10) / 10,
      };
    });

    // Calculate current period metrics
    const currentInvalid =
      currentMonthData.totalIssues - currentMonthData.validCount;
    const currentFilteringRate = calculateAIFilteringRate(
      currentInvalid,
      currentMonthData.duplicateCount,
      currentMonthData.totalIssues
    );
    const currentResolutionRate = calculateAutoResolutionRate(
      currentMonthData.fixSuccessCount,
      currentMonthData.fixAttemptedCount
    );

    // Calculate previous period metrics for deltas
    let prevFilteringRate = 0;
    let prevResolutionRate = 0;
    let prevResponseTime = 0;
    let prevCost = 0;

    if (previousMonthData) {
      const prevInvalid =
        previousMonthData.totalIssues - previousMonthData.validCount;
      prevFilteringRate = calculateAIFilteringRate(
        prevInvalid,
        previousMonthData.duplicateCount,
        previousMonthData.totalIssues
      );
      prevResolutionRate = calculateAutoResolutionRate(
        previousMonthData.fixSuccessCount,
        previousMonthData.fixAttemptedCount
      );
      prevResponseTime = previousMonthData.avgResponseSeconds;
      prevCost = previousMonthData.totalCostUsd;
    }

    const metrics: OperationsMetrics = {
      aiFilteringRate: Math.round(currentFilteringRate * 10) / 10,
      aiFilteringDelta: Math.round(
        calculateDelta(currentFilteringRate, prevFilteringRate) * 10
      ) / 10,
      autoResolutionRate: Math.round(currentResolutionRate * 10) / 10,
      autoResolutionDelta: Math.round(
        calculateDelta(currentResolutionRate, prevResolutionRate) * 10
      ) / 10,
      avgResponseTimeSeconds: Math.round(currentMonthData.avgResponseSeconds),
      avgResponseTimeDelta: Math.round(
        calculateDelta(currentMonthData.avgResponseSeconds, prevResponseTime) * 10
      ) / 10,
      totalCostUSD: Math.round(currentMonthData.totalCostUsd * 100) / 100,
      totalCostDelta: Math.round(
        calculateDelta(currentMonthData.totalCostUsd, prevCost) * 10
      ) / 10,
      dailyTrend,
      decisionDistribution: {
        valid: currentMonthData.validCount,
        invalid: currentInvalid,
        duplicate: currentMonthData.duplicateCount,
        needsInfo: currentMonthData.needsInfoCount,
      },
      processingTimes: processingTimes || {
        triageSeconds: 12,
        analyzeSeconds: 45,
        fixSeconds: 180,
      },
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in operations metrics API:', error);
    // Fallback to mock data on error
    res.status(200).json(mockOperationsMetrics);
  }
}
