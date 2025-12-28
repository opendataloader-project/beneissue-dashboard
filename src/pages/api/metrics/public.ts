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

    // Calculate invalid count: ai_filtered - duplicate (ai_filtered includes invalid + duplicate)
    const invalidCount = totalMetrics.aiFilteredCount - totalMetrics.duplicateCount;
    const autoResolutionRate = calculateAutoResolutionRate(
      invalidCount,
      totalMetrics.duplicateCount,
      totalMetrics.needsInfoCount,
      totalMetrics.fixSuccessCount,
      totalMetrics.commentOnlyCount,
      totalMetrics.uniqueIssues
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
        issuesProcessed: m.uniqueIssues,
        costSavings: Math.round(monthSavings.netSavings),
        timeSavedHours: Math.round(monthSavedMinutes / 60),
        roi: Math.round(monthRoi),
      };
    });

    const metrics: PublicMetrics = {
      totalIssuesProcessed: totalMetrics.uniqueIssues,
      avgResponseTimeSeconds: Math.round(totalMetrics.avgResponseSeconds),
      autoResolutionRate: Math.round(autoResolutionRate * 10) / 10,
      totalCostUSD: Math.round(totalMetrics.totalCostUsd * 100) / 100,
      monthlyTrend,
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in public metrics API:', error);
    res.status(200).json(null);
  }
}
