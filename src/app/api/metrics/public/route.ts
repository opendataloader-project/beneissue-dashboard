import { NextResponse } from "next/server";

import type { PublicMetrics } from "@/types/metrics";
import { fetchTotalMetrics } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  // Return null if Supabase is not configured
  if (!isSupabaseConfigured) {
    return NextResponse.json(null);
  }

  try {
    const totalMetrics = await fetchTotalMetrics();

    // Return null if no data
    if (!totalMetrics) {
      return NextResponse.json(null);
    }

    const metrics: PublicMetrics = {
      totalIssuesProcessed: totalMetrics.uniqueIssues,
      avgResponseTimeSeconds: Math.round(totalMetrics.avgResponseSeconds),
      autoResolutionRate: Math.round(totalMetrics.autoResolutionRate * 10) / 10,
      costPerIssueUSD: Math.round(totalMetrics.costPerIssue * 100) / 100,
      monthlyTrend: totalMetrics.monthlyTrend,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in public metrics API:", error);
    return NextResponse.json(null);
  }
}
