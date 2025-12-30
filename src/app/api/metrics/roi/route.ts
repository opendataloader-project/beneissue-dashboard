import { NextRequest, NextResponse } from "next/server";

import type { PeriodFilter } from "@/types/metrics";
import type { DeveloperRole, ROIMetrics } from "@/types/roi";
import { fetchWorkflowRuns } from "@/lib/db";
import { calculateROIMetrics, calculateDelta } from "@/lib/roi-calculator";
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
      // Default to 1 year
      const defaultYearAgo = new Date(now);
      defaultYearAgo.setFullYear(now.getFullYear() - 1);
      startDate = defaultYearAgo.toISOString().split("T")[0];
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
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const durationMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - durationMs);
        return {
          startDate: prevStart.toISOString().split("T")[0],
          endDate: prevEnd.toISOString().split("T")[0],
        };
      }
      return { startDate: "1970-01-01", endDate: "1970-01-01" };
    }
    case "all": {
      return { startDate: "1970-01-01", endDate: "1970-01-01" };
    }
    default:
      return getPreviousPeriodRange("1year");
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(null);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") as PeriodFilter) || "1year";
    const developerRole =
      (searchParams.get("role") as DeveloperRole) || "application_developer";

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

    // Calculate ROI metrics (all in USD)
    const current = calculateROIMetrics(currentRuns, developerRole);
    const prev = calculateROIMetrics(prevRuns, developerRole);

    // Add deltas
    const metrics: ROIMetrics = {
      ...current,
      savingsDelta: calculateDelta(current.netSavings, prev.netSavings),
      roiDelta: calculateDelta(current.roiPercentage, prev.roiPercentage),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in ROI metrics API:", error);
    return NextResponse.json(null);
  }
}
