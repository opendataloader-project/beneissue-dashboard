import { NextResponse } from 'next/server';
import { fetchMonthlyTrend } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  calculateSavedMinutes,
  calculateCostSavings,
  calculateROI,
  calculateDelta,
} from '@/lib/metrics';
import type { ExecutiveMetrics, MonthlyData } from '@/types/metrics';

export async function GET() {
  // Return null if Supabase is not configured
  if (!isSupabaseConfigured) {
    return NextResponse.json(null);
  }

  try {
    const monthlyTrendRaw = await fetchMonthlyTrend(6);

    // Return null if no data
    if (monthlyTrendRaw.length === 0) {
      return NextResponse.json(null);
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
        issuesProcessed: m.uniqueIssues,
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

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in executive metrics API:', error);
    return NextResponse.json(null);
  }
}
