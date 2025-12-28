import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchDailyMetrics,
  fetchProcessingTimes,
} from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  calculateAutoResolutionRate,
  calculateDelta,
} from '@/lib/metrics';
import type { DashboardMetrics, DailyData, PeriodFilter } from '@/types/metrics';

function getDateRange(period: PeriodFilter): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;

  switch (period) {
    case 'today':
      startDate = endDate;
      break;
    case 'this_week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = weekStart.toISOString().split('T')[0];
      break;
    }
    case 'this_month': {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      break;
    }
    case 'last_90_days': {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split('T')[0];
      break;
    }
    case 'last_year': {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      startDate = oneYearAgo.toISOString().split('T')[0];
      break;
    }
    case 'all': {
      startDate = '2020-01-01';
      break;
    }
    default:
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  return { startDate, endDate };
}

function getPreviousPeriodRange(period: PeriodFilter): { startDate: string; endDate: string } {
  const now = new Date();

  switch (period) {
    case 'today': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];
      return { startDate: date, endDate: date };
    }
    case 'this_week': {
      const prevWeekEnd = new Date(now);
      prevWeekEnd.setDate(now.getDate() - now.getDay() - 1);
      const prevWeekStart = new Date(prevWeekEnd);
      prevWeekStart.setDate(prevWeekEnd.getDate() - 6);
      return {
        startDate: prevWeekStart.toISOString().split('T')[0],
        endDate: prevWeekEnd.toISOString().split('T')[0],
      };
    }
    case 'this_month': {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: prevMonth.toISOString().split('T')[0],
        endDate: prevMonthEnd.toISOString().split('T')[0],
      };
    }
    case 'last_90_days': {
      const oneEightyDaysAgo = new Date(now);
      oneEightyDaysAgo.setDate(now.getDate() - 180);
      const ninetyOneDaysAgo = new Date(now);
      ninetyOneDaysAgo.setDate(now.getDate() - 91);
      return {
        startDate: oneEightyDaysAgo.toISOString().split('T')[0],
        endDate: ninetyOneDaysAgo.toISOString().split('T')[0],
      };
    }
    case 'last_year': {
      const twoYearsAgo = new Date(now);
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      const oneYearOneDayAgo = new Date(now);
      oneYearOneDayAgo.setFullYear(now.getFullYear() - 1);
      oneYearOneDayAgo.setDate(oneYearOneDayAgo.getDate() - 1);
      return {
        startDate: twoYearsAgo.toISOString().split('T')[0],
        endDate: oneYearOneDayAgo.toISOString().split('T')[0],
      };
    }
    case 'all': {
      // For "all", no meaningful previous period - return empty range
      return { startDate: '1970-01-01', endDate: '1970-01-01' };
    }
    default:
      return getPreviousPeriodRange('this_month');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardMetrics | null>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isSupabaseConfigured) {
    return res.status(200).json(null);
  }

  try {
    const period = (req.query.period as PeriodFilter) || 'this_month';
    const { startDate, endDate } = getDateRange(period);
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriodRange(period);

    const [dailyMetrics, prevDailyMetrics, processingTimes] = await Promise.all([
      fetchDailyMetrics(startDate, endDate),
      fetchDailyMetrics(prevStartDate, prevEndDate),
      fetchProcessingTimes(),
    ]);

    if (dailyMetrics.length === 0) {
      return res.status(200).json(null);
    }

    // Aggregate current period data
    const current = dailyMetrics.reduce(
      (acc, day) => ({
        uniqueIssues: acc.uniqueIssues + (day.unique_issues || 0),
        triageCount: acc.triageCount + (day.triage_count || 0),
        analyzeCount: acc.analyzeCount + (day.analyze_count || 0),
        fixCount: acc.fixCount + (day.fix_count || 0),
        aiFilteredCount: acc.aiFilteredCount + (day.ai_filtered_count || 0),
        validCount: acc.validCount + (day.valid_count || 0),
        duplicateCount: acc.duplicateCount + (day.duplicate_count || 0),
        needsInfoCount: acc.needsInfoCount + (day.needs_info_count || 0),
        fixAttemptedCount: acc.fixAttemptedCount + (day.fix_attempted_count || 0),
        fixSuccessCount: acc.fixSuccessCount + (day.fix_success_count || 0),
        commentOnlyCount: acc.commentOnlyCount + (day.comment_only_count || 0),
        totalCostUsd: acc.totalCostUsd + (day.total_input_cost || 0) + (day.total_output_cost || 0),
        totalResponseSeconds: acc.totalResponseSeconds + (day.avg_first_response_seconds || 0),
        responseCount: acc.responseCount + (day.avg_first_response_seconds ? 1 : 0),
      }),
      {
        uniqueIssues: 0,
        triageCount: 0,
        analyzeCount: 0,
        fixCount: 0,
        aiFilteredCount: 0,
        validCount: 0,
        duplicateCount: 0,
        needsInfoCount: 0,
        fixAttemptedCount: 0,
        fixSuccessCount: 0,
        commentOnlyCount: 0,
        totalCostUsd: 0,
        totalResponseSeconds: 0,
        responseCount: 0,
      }
    );

    // Aggregate previous period data for delta calculations
    const prev = prevDailyMetrics.reduce(
      (acc, day) => ({
        uniqueIssues: acc.uniqueIssues + (day.unique_issues || 0),
        triageCount: acc.triageCount + (day.triage_count || 0),
        analyzeCount: acc.analyzeCount + (day.analyze_count || 0),
        fixCount: acc.fixCount + (day.fix_count || 0),
        aiFilteredCount: acc.aiFilteredCount + (day.ai_filtered_count || 0),
        validCount: acc.validCount + (day.valid_count || 0),
        duplicateCount: acc.duplicateCount + (day.duplicate_count || 0),
        needsInfoCount: acc.needsInfoCount + (day.needs_info_count || 0),
        fixSuccessCount: acc.fixSuccessCount + (day.fix_success_count || 0),
        commentOnlyCount: acc.commentOnlyCount + (day.comment_only_count || 0),
        totalCostUsd: acc.totalCostUsd + (day.total_input_cost || 0) + (day.total_output_cost || 0),
        totalResponseSeconds: acc.totalResponseSeconds + (day.avg_first_response_seconds || 0),
        responseCount: acc.responseCount + (day.avg_first_response_seconds ? 1 : 0),
      }),
      {
        uniqueIssues: 0,
        triageCount: 0,
        analyzeCount: 0,
        fixCount: 0,
        aiFilteredCount: 0,
        validCount: 0,
        duplicateCount: 0,
        needsInfoCount: 0,
        fixSuccessCount: 0,
        commentOnlyCount: 0,
        totalCostUsd: 0,
        totalResponseSeconds: 0,
        responseCount: 0,
      }
    );

    // Calculate metrics
    const currentInvalid = current.aiFilteredCount - current.duplicateCount;
    const prevInvalid = prev.aiFilteredCount - prev.duplicateCount;

    const currentAutoResolution = calculateAutoResolutionRate(
      currentInvalid,
      current.duplicateCount,
      current.needsInfoCount,
      current.fixSuccessCount,
      current.commentOnlyCount,
      current.uniqueIssues
    );

    const prevAutoResolution = prev.uniqueIssues > 0
      ? calculateAutoResolutionRate(
          prevInvalid,
          prev.duplicateCount,
          prev.needsInfoCount,
          prev.fixSuccessCount,
          prev.commentOnlyCount,
          prev.uniqueIssues
        )
      : 0;

    const currentAvgResponse = current.responseCount > 0
      ? current.totalResponseSeconds / current.responseCount
      : 0;
    const prevAvgResponse = prev.responseCount > 0
      ? prev.totalResponseSeconds / prev.responseCount
      : 0;

    // Transform daily data for chart
    const dailyTrend: DailyData[] = dailyMetrics.map((d) => {
      const uniqueIssues = d.unique_issues || 1;
      const invalidCount = (d.ai_filtered_count || 0) - (d.duplicate_count || 0);
      const filteringRate = uniqueIssues > 0
        ? ((invalidCount + (d.duplicate_count || 0)) / uniqueIssues) * 100
        : 0;

      return {
        date: d.date,
        triageCount: d.triage_count || 0,
        analyzeCount: d.analyze_count || 0,
        fixCount: d.fix_count || 0,
        filteringRate: Math.round(filteringRate * 10) / 10,
      };
    });

    const metrics: DashboardMetrics = {
      totalIssuesProcessed: current.uniqueIssues,
      totalIssuesDelta: Math.round(calculateDelta(current.uniqueIssues, prev.uniqueIssues)),
      autoResolutionRate: Math.round(currentAutoResolution * 10) / 10,
      autoResolutionDelta: Math.round(calculateDelta(currentAutoResolution, prevAutoResolution) * 10) / 10,
      avgResponseTimeSeconds: Math.round(currentAvgResponse),
      avgResponseTimeDelta: Math.round(calculateDelta(currentAvgResponse, prevAvgResponse) * 10) / 10,
      totalCostUSD: Math.round(current.totalCostUsd * 100) / 100,
      totalCostDelta: Math.round(calculateDelta(current.totalCostUsd, prev.totalCostUsd) * 10) / 10,
      costPerIssueUSD: current.uniqueIssues > 0
        ? Math.round((current.totalCostUsd / current.uniqueIssues) * 1000) / 1000
        : 0,
      dailyTrend,
      decisionDistribution: {
        valid: current.validCount,
        invalid: Math.max(0, currentInvalid),
        duplicate: current.duplicateCount,
        needsInfo: current.needsInfoCount,
      },
      processingTimes: processingTimes || {
        triageSeconds: 0,
        analyzeSeconds: 0,
        fixSeconds: 0,
      },
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in dashboard metrics API:', error);
    res.status(200).json(null);
  }
}
