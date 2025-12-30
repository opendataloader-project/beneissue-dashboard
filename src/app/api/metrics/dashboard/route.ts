import { NextRequest, NextResponse } from "next/server";

import type {
  CostTrendData,
  DashboardMetrics,
  PeriodFilter,
  TrendData,
} from "@/types/metrics";
import {
  calculateDailyCostTrend,
  calculateDailyTrend,
  calculateMonthlyCostTrend,
  calculateMonthlyTrend,
  calculateResolutionDistribution,
  calculateUniqueIssueMetrics,
  fetchWorkflowRuns,
} from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

function getDateRange(period: PeriodFilter): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];
  let startDate: string;

  switch (period) {
    case "1week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split("T")[0];
      break;
    }
    case "1month": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split("T")[0];
      break;
    }
    case "90days": {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split("T")[0];
      break;
    }
    case "1year": {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      startDate = oneYearAgo.toISOString().split("T")[0];
      break;
    }
    case "all": {
      startDate = "2020-01-01";
      break;
    }
    default:
      // Default to 1 month
      const defaultMonthAgo = new Date(now);
      defaultMonthAgo.setMonth(now.getMonth() - 1);
      startDate = defaultMonthAgo.toISOString().split("T")[0];
  }

  return { startDate, endDate };
}

function getPreviousPeriodRange(
  period: PeriodFilter,
  customStartDate?: string,
  customEndDate?: string
): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();

  switch (period) {
    case "1week": {
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(now.getDate() - 14);
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return {
        startDate: twoWeeksAgo.toISOString().split("T")[0],
        endDate: oneWeekAgo.toISOString().split("T")[0],
      };
    }
    case "1month": {
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(now.getMonth() - 2);
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return {
        startDate: twoMonthsAgo.toISOString().split("T")[0],
        endDate: oneMonthAgo.toISOString().split("T")[0],
      };
    }
    case "90days": {
      const oneEightyDaysAgo = new Date(now);
      oneEightyDaysAgo.setDate(now.getDate() - 180);
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return {
        startDate: oneEightyDaysAgo.toISOString().split("T")[0],
        endDate: ninetyDaysAgo.toISOString().split("T")[0],
      };
    }
    case "1year": {
      const twoYearsAgo = new Date(now);
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return {
        startDate: twoYearsAgo.toISOString().split("T")[0],
        endDate: oneYearAgo.toISOString().split("T")[0],
      };
    }
    case "custom": {
      // For custom range, calculate previous period of same duration
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const durationMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1); // Day before current start
        const prevStart = new Date(prevEnd.getTime() - durationMs);
        return {
          startDate: prevStart.toISOString().split("T")[0],
          endDate: prevEnd.toISOString().split("T")[0],
        };
      }
      return { startDate: "1970-01-01", endDate: "1970-01-01" };
    }
    case "all": {
      // For "all", no meaningful previous period
      return { startDate: "1970-01-01", endDate: "1970-01-01" };
    }
    default:
      return getPreviousPeriodRange("1month");
  }
}

function calculateDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

type WorkflowRunsResult =
  ReturnType<typeof fetchWorkflowRuns> extends Promise<infer T> ? T : never;

function getTrendData(
  runs: WorkflowRunsResult,
  period: PeriodFilter,
  customStartDate?: string,
  customEndDate?: string
): TrendData[] {
  // Determine daily or monthly trend based on period
  // 1 week, 1 month: daily
  // 90 days, 1 year, all: monthly
  // custom: auto-determine based on duration
  if (period === "1week") {
    return calculateDailyTrend(runs, 7);
  } else if (period === "1month") {
    return calculateDailyTrend(runs, 30);
  } else if (period === "90days") {
    return calculateMonthlyTrend(runs, 3);
  } else if (period === "1year") {
    return calculateMonthlyTrend(runs, 12);
  } else if (period === "custom" && customStartDate && customEndDate) {
    // Calculate days in custom range
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Use daily for ranges <= 60 days, monthly for longer
    if (days <= 60) {
      return calculateDailyTrend(runs, days);
    } else {
      const months = Math.ceil(days / 30);
      return calculateMonthlyTrend(runs, months);
    }
  } else {
    // all
    return calculateMonthlyTrend(runs, 12);
  }
}

function getCostTrendData(
  runs: WorkflowRunsResult,
  period: PeriodFilter,
  customStartDate?: string,
  customEndDate?: string
): CostTrendData[] {
  // Determine daily or monthly cost trend based on period
  if (period === "1week") {
    return calculateDailyCostTrend(runs, 7);
  } else if (period === "1month") {
    return calculateDailyCostTrend(runs, 30);
  } else if (period === "90days") {
    return calculateMonthlyCostTrend(runs, 3);
  } else if (period === "1year") {
    return calculateMonthlyCostTrend(runs, 12);
  } else if (period === "custom" && customStartDate && customEndDate) {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 60) {
      return calculateDailyCostTrend(runs, days);
    } else {
      const months = Math.ceil(days / 30);
      return calculateMonthlyCostTrend(runs, months);
    }
  } else {
    // all
    return calculateMonthlyCostTrend(runs, 12);
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(null);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") as PeriodFilter) || "1month";

    // Handle custom date range
    let startDate: string;
    let endDate: string;

    if (period === "custom") {
      const customStart = searchParams.get("startDate");
      const customEnd = searchParams.get("endDate");
      if (!customStart || !customEnd) {
        return NextResponse.json(
          { error: "startDate and endDate are required for custom period" },
          { status: 400 }
        );
      }
      startDate = customStart;
      endDate = customEnd;
    } else {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }
    const { startDate: prevStartDate, endDate: prevEndDate } =
      getPreviousPeriodRange(period, startDate, endDate);

    // Get optional repo filter
    const repo = searchParams.get("repo") || undefined;

    // Fetch current and previous period data
    const [currentRuns, prevRuns] = await Promise.all([
      fetchWorkflowRuns(startDate, endDate, repo),
      fetchWorkflowRuns(prevStartDate, prevEndDate, repo),
    ]);

    if (currentRuns.length === 0) {
      return NextResponse.json(null);
    }

    // Calculate metrics
    const current = calculateUniqueIssueMetrics(currentRuns);
    const prev = calculateUniqueIssueMetrics(prevRuns);

    // Get trend data
    const trendData = getTrendData(currentRuns, period, startDate, endDate);

    // Get cost trend data
    const costTrendData = getCostTrendData(
      currentRuns,
      period,
      startDate,
      endDate
    );

    // Get resolution distribution
    const resolutionDistribution = calculateResolutionDistribution(currentRuns);

    const metrics: DashboardMetrics = {
      totalIssuesProcessed: current.uniqueIssues,
      totalIssuesDelta: Math.round(
        calculateDelta(current.uniqueIssues, prev.uniqueIssues)
      ),
      autoResolutionRate: Math.round(current.autoResolutionRate * 10) / 10,
      autoResolutionDelta:
        Math.round(
          calculateDelta(current.autoResolutionRate, prev.autoResolutionRate) *
            10
        ) / 10,
      avgResponseTimeSeconds: Math.round(current.avgResponseSeconds),
      avgResponseTimeDelta:
        Math.round(
          calculateDelta(current.avgResponseSeconds, prev.avgResponseSeconds) *
            10
        ) / 10,
      totalCostUSD: Math.round(current.totalCost * 100) / 100,
      totalCostDelta:
        Math.round(calculateDelta(current.totalCost, prev.totalCost) * 10) / 10,
      costPerIssueUSD: Math.round(current.costPerIssue * 1000) / 1000,
      trendData,
      costTrendData,
      resolutionDistribution,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in dashboard metrics API:", error);
    return NextResponse.json(null);
  }
}
