import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTotalMetrics, fetchMonthlyTrend } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  calculateSavedMinutes,
  calculateCostSavings,
  calculateROI,
  calculateAutoResolutionRate,
} from '@/lib/metrics';
import type { PublicMetrics, MonthlyData } from '@/types/metrics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicMetrics | null>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Return null if Supabase is not configured
  if (!isSupabaseConfigured) {
    return res.status(200).json(null);
  }

  try {
    const [totalMetrics, monthlyTrendRaw] = await Promise.all([
      fetchTotalMetrics(),
      fetchMonthlyTrend(6),
    ]);

    // Return null if no data
    if (!totalMetrics || monthlyTrendRaw.length === 0) {
      return res.status(200).json(null);
    }

    // Calculate derived metrics
    const savedMinutes = calculateSavedMinutes(
      totalMetrics.triageCount,
      totalMetrics.analyzeCount,
      totalMetrics.fixSuccessCount
    );
    const { netSavings, aiCost } = calculateCostSavings(
      savedMinutes,
      totalMetrics.totalCostUsd
    );
    const roi = calculateROI(netSavings, aiCost);
    const autoResolutionRate = calculateAutoResolutionRate(
      totalMetrics.fixSuccessCount,
      totalMetrics.fixAttemptedCount
    );

    // Transform monthly trend data
    const monthlyTrend: MonthlyData[] = monthlyTrendRaw.map((m) => {
      const monthSavedMinutes = calculateSavedMinutes(
        m.triageCount,
        m.analyzeCount,
        m.fixSuccessCount
      );
      const monthSavings = calculateCostSavings(monthSavedMinutes, m.totalCostUsd);
      const monthRoi = calculateROI(monthSavings.netSavings, monthSavings.aiCost);

      return {
        month: m.month,
        issuesProcessed: m.totalIssues,
        costSavings: Math.round(monthSavings.netSavings),
        timeSavedHours: Math.round(monthSavedMinutes / 60),
        roi: Math.round(monthRoi),
      };
    });

    const metrics: PublicMetrics = {
      totalIssuesProcessed: totalMetrics.totalIssues,
      avgResponseTimeSeconds: Math.round(totalMetrics.avgResponseSeconds),
      autoResolutionRate: Math.round(autoResolutionRate * 10) / 10,
      roi: Math.round(roi),
      monthlyTrend,
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in public metrics API:', error);
    res.status(200).json(null);
  }
}
