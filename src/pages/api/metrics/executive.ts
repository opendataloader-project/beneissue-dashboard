import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchMonthlyTrend, fetchMonthlyAggregates } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  calculateSavedMinutes,
  calculateCostSavings,
  calculateROI,
  calculateDelta,
} from '@/lib/metrics';
import { mockExecutiveMetrics } from '@/data/mock';
import type { ExecutiveMetrics, MonthlyData } from '@/types/metrics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutiveMetrics>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Use mock data if Supabase is not configured
  if (!isSupabaseConfigured) {
    return res.status(200).json(mockExecutiveMetrics);
  }

  try {
    const monthlyTrendRaw = await fetchMonthlyTrend(6);

    // Fallback to mock if no data
    if (monthlyTrendRaw.length === 0) {
      return res.status(200).json(mockExecutiveMetrics);
    }

    // Transform monthly trend data and calculate derived metrics
    const monthlyTrend: MonthlyData[] = monthlyTrendRaw.map((m) => {
      const savedMinutes = calculateSavedMinutes(
        m.triageCount,
        m.analyzeCount,
        m.fixSuccessCount
      );
      const savings = calculateCostSavings(savedMinutes, m.totalCostUsd);
      const roi = calculateROI(savings.netSavings, savings.aiCost);

      return {
        month: m.month,
        issuesProcessed: m.totalIssues,
        costSavings: Math.round(savings.netSavings),
        timeSavedHours: Math.round(savedMinutes / 60),
        roi: Math.round(roi),
      };
    });

    const currentMonth = monthlyTrend[monthlyTrend.length - 1];
    const previousMonth =
      monthlyTrend.length > 1
        ? monthlyTrend[monthlyTrend.length - 2]
        : currentMonth;

    // Get current month raw data for distribution
    const now = new Date();
    const currentMonthRaw = monthlyTrendRaw[monthlyTrendRaw.length - 1];

    const metrics: ExecutiveMetrics = {
      roi: currentMonth.roi,
      roiDelta: calculateDelta(currentMonth.roi, previousMonth.roi),
      timeSavedHours: currentMonth.timeSavedHours,
      timeSavedDelta: calculateDelta(
        currentMonth.timeSavedHours,
        previousMonth.timeSavedHours
      ),
      costSavingsKRW: currentMonth.costSavings,
      costSavingsDelta: calculateDelta(
        currentMonth.costSavings,
        previousMonth.costSavings
      ),
      issuesProcessed: currentMonth.issuesProcessed,
      issuesProcessedDelta: calculateDelta(
        currentMonth.issuesProcessed,
        previousMonth.issuesProcessed
      ),
      monthlyTrend,
      processingDistribution: {
        triage: currentMonthRaw?.triageCount || 0,
        analyze: currentMonthRaw?.analyzeCount || 0,
        fix: currentMonthRaw?.fixCount || 0,
      },
      summaryText: `이번 달 AI가 ${currentMonth.issuesProcessed.toLocaleString()}건 처리, ${currentMonth.timeSavedHours}시간 절약, ROI ${currentMonth.roi}%`,
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in executive metrics API:', error);
    // Fallback to mock data on error
    res.status(200).json(mockExecutiveMetrics);
  }
}
