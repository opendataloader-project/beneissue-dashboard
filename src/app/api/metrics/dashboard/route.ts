import { NextRequest, NextResponse } from "next/server";

import type { DashboardMetrics, PeriodFilter, TrendData } from "@/types/metrics";
import {
  fetchWorkflowRuns,
  calculateUniqueIssueMetrics,
  calculateDailyTrend,
  calculateMonthlyTrend,
  calculateResolutionDistribution,
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

function getPreviousPeriodRange(period: PeriodFilter): {
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

function getTrendData(
  runs: ReturnType<typeof fetchWorkflowRuns> extends Promise<infer T> ? T : never,
  period: PeriodFilter
): TrendData[] {
  // 기간에 따라 일별 또는 월별 추이 결정
  // 1주, 1달: 일별
  // 90일, 1년, 전체: 월별
  if (period === "1week") {
    return calculateDailyTrend(runs, 7);
  } else if (period === "1month") {
    return calculateDailyTrend(runs, 30);
  } else if (period === "90days") {
    return calculateMonthlyTrend(runs, 3);
  } else if (period === "1year") {
    return calculateMonthlyTrend(runs, 12);
  } else {
    // all
    return calculateMonthlyTrend(runs, 12);
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(null);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") as PeriodFilter) || "1month";

    const { startDate, endDate } = getDateRange(period);
    const { startDate: prevStartDate, endDate: prevEndDate } =
      getPreviousPeriodRange(period);

    // Fetch current and previous period data
    const [currentRuns, prevRuns] = await Promise.all([
      fetchWorkflowRuns(startDate, endDate),
      fetchWorkflowRuns(prevStartDate, prevEndDate),
    ]);

    if (currentRuns.length === 0) {
      return NextResponse.json(null);
    }

    // Calculate metrics
    const current = calculateUniqueIssueMetrics(currentRuns);
    const prev = calculateUniqueIssueMetrics(prevRuns);

    // Get trend data
    const trendData = getTrendData(currentRuns, period);

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
          calculateDelta(current.autoResolutionRate, prev.autoResolutionRate) * 10
        ) / 10,
      avgResponseTimeSeconds: Math.round(current.avgResponseSeconds),
      avgResponseTimeDelta:
        Math.round(
          calculateDelta(current.avgResponseSeconds, prev.avgResponseSeconds) * 10
        ) / 10,
      totalCostUSD: Math.round(current.totalCost * 100) / 100,
      totalCostDelta:
        Math.round(calculateDelta(current.totalCost, prev.totalCost) * 10) / 10,
      costPerIssueUSD: Math.round(current.costPerIssue * 1000) / 1000,
      trendData,
      resolutionDistribution,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in dashboard metrics API:", error);
    return NextResponse.json(null);
  }
}
