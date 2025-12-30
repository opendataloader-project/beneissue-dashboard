import type {
  CostTrendData,
  ResolutionDistribution,
  TrendData,
  WorkflowRun,
} from "@/types/metrics";

import { isSupabaseConfigured, supabase } from "./supabase";

// Token pricing per million tokens (MTok)
const PRICING = {
  "claude-haiku-4-5": {
    input: 1, // $1 / MTok
    output: 5, // $5 / MTok
  },
  "claude-sonnet-4-5": {
    input: 3, // $3 / MTok
    output: 15, // $15 / MTok
  },
} as const;

/**
 * Calculate cost based on workflow_type and token counts
 * triage -> claude-haiku-4-5
 * analyze/fix -> claude-sonnet-4-5
 */
function calculateRunCost(run: WorkflowRun): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
} {
  const pricing =
    run.workflow_type === "triage"
      ? PRICING["claude-haiku-4-5"]
      : PRICING["claude-sonnet-4-5"];

  const inputCost = (run.input_tokens / 1_000_000) * pricing.input;
  const outputCost = (run.output_tokens / 1_000_000) * pricing.output;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

/**
 * Fetch distinct repo names from workflow_runs
 */
export async function fetchDistinctRepos(): Promise<string[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("workflow_runs")
    .select("repo")
    .order("repo", { ascending: true });

  if (error) {
    console.error("Error fetching distinct repos:", error);
    return [];
  }

  // Get unique repos
  const uniqueRepos = [...new Set(data?.map((d) => d.repo) || [])];
  return uniqueRepos;
}

/**
 * Check auto-resolution condition
 * Auto-resolved = fix_decision is NOT 'manual_required'
 * Manual required = fix_decision is 'manual_required'
 */
function isAutoResolved(run: WorkflowRun): boolean {
  return run.fix_decision !== "manual_required";
}

/**
 * Generate unique issue key
 */
function getUniqueIssueKey(run: WorkflowRun): string {
  return `${run.repo}:${run.issue_number}`;
}

/**
 * Fetch workflow runs for a date range
 */
export async function fetchWorkflowRuns(
  startDate?: string,
  endDate?: string,
  repo?: string
): Promise<WorkflowRun[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  let query = supabase
    .from("workflow_runs")
    .select("*")
    .order("workflow_started_at", { ascending: true });

  if (startDate) {
    query = query.gte("workflow_started_at", startDate);
  }
  if (endDate) {
    query = query.lte("workflow_started_at", endDate + "T23:59:59");
  }
  if (repo) {
    query = query.eq("repo", repo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching workflow runs:", error);
    return [];
  }

  return data || [];
}

/**
 * Calculate metrics per unique issue
 * Same (repo, issue_number) combination counts as 1
 */
export function calculateUniqueIssueMetrics(runs: WorkflowRun[]) {
  const issueMap = new Map<
    string,
    {
      runs: WorkflowRun[];
      firstResponseSeconds: number | null;
      totalCost: number;
      isAutoResolved: boolean;
    }
  >();

  // Group by issue
  for (const run of runs) {
    const key = getUniqueIssueKey(run);

    if (!issueMap.has(key)) {
      issueMap.set(key, {
        runs: [],
        firstResponseSeconds: null,
        totalCost: 0,
        isAutoResolved: false,
      });
    }

    const issue = issueMap.get(key)!;
    issue.runs.push(run);
    issue.totalCost += calculateRunCost(run).totalCost;

    // Auto-resolution status (auto-resolved if any run meets condition)
    if (isAutoResolved(run)) {
      issue.isAutoResolved = true;
    }

    // Calculate first response time (issue creation to first workflow start)
    if (run.issue_created_at && run.workflow_started_at) {
      const issueCreated = new Date(run.issue_created_at).getTime();
      const workflowStarted = new Date(run.workflow_started_at).getTime();
      const responseSeconds = (workflowStarted - issueCreated) / 1000;

      if (
        issue.firstResponseSeconds === null ||
        responseSeconds < issue.firstResponseSeconds
      ) {
        issue.firstResponseSeconds = responseSeconds;
      }
    }
  }

  // Calculate metrics
  const uniqueIssues = issueMap.size;
  let autoResolvedCount = 0;
  let totalResponseSeconds = 0;
  let responseCount = 0;
  let totalCost = 0;

  for (const issue of issueMap.values()) {
    if (issue.isAutoResolved) {
      autoResolvedCount++;
    }
    if (issue.firstResponseSeconds !== null && issue.firstResponseSeconds > 0) {
      totalResponseSeconds += issue.firstResponseSeconds;
      responseCount++;
    }
    totalCost += issue.totalCost;
  }

  const manualRequiredCount = uniqueIssues - autoResolvedCount;
  const autoResolutionRate =
    uniqueIssues > 0 ? (autoResolvedCount / uniqueIssues) * 100 : 0;
  const avgResponseSeconds =
    responseCount > 0 ? totalResponseSeconds / responseCount : 0;
  const costPerIssue = uniqueIssues > 0 ? totalCost / uniqueIssues : 0;

  return {
    uniqueIssues,
    autoResolvedCount,
    manualRequiredCount,
    autoResolutionRate,
    avgResponseSeconds,
    totalCost,
    costPerIssue,
  };
}

/**
 * Generate monthly trend data
 */
export function calculateMonthlyTrend(
  runs: WorkflowRun[],
  months: number = 6
): TrendData[] {
  const now = new Date();
  const monthlyData: Map<string, WorkflowRun[]> = new Map();

  // Initialize last N months
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(monthKey, []);
  }

  // Classify data
  for (const run of runs) {
    const date = new Date(run.workflow_started_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (monthlyData.has(monthKey)) {
      monthlyData.get(monthKey)!.push(run);
    }
  }

  // Calculate monthly metrics
  const trend: TrendData[] = [];
  for (const [month, monthRuns] of monthlyData) {
    const metrics = calculateUniqueIssueMetrics(monthRuns);
    trend.push({
      period: month,
      autoResolved: metrics.autoResolvedCount,
      manualRequired: metrics.manualRequiredCount,
      autoResolutionRate: Math.round(metrics.autoResolutionRate * 10) / 10,
    });
  }

  return trend;
}

/**
 * Generate daily trend data
 */
export function calculateDailyTrend(
  runs: WorkflowRun[],
  days: number = 14
): TrendData[] {
  const now = new Date();
  const dailyData: Map<string, WorkflowRun[]> = new Map();

  // Initialize last N days
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dateKey = targetDate.toISOString().split("T")[0];
    dailyData.set(dateKey, []);
  }

  // Classify data
  for (const run of runs) {
    const dateKey = run.workflow_started_at.split("T")[0];

    if (dailyData.has(dateKey)) {
      dailyData.get(dateKey)!.push(run);
    }
  }

  // Calculate daily metrics
  const trend: TrendData[] = [];
  for (const [date, dayRuns] of dailyData) {
    const metrics = calculateUniqueIssueMetrics(dayRuns);
    trend.push({
      period: date,
      autoResolved: metrics.autoResolvedCount,
      manualRequired: metrics.manualRequiredCount,
      autoResolutionRate: Math.round(metrics.autoResolutionRate * 10) / 10,
    });
  }

  return trend;
}

/**
 * Calculate resolution distribution
 */
export function calculateResolutionDistribution(
  runs: WorkflowRun[]
): ResolutionDistribution {
  const metrics = calculateUniqueIssueMetrics(runs);
  return {
    autoResolved: metrics.autoResolvedCount,
    manualRequired: metrics.manualRequiredCount,
  };
}

/**
 * Generate monthly cost trend data
 */
export function calculateMonthlyCostTrend(
  runs: WorkflowRun[],
  months: number = 6
): CostTrendData[] {
  const now = new Date();
  const monthlyData: Map<string, WorkflowRun[]> = new Map();

  // Initialize last N months
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(monthKey, []);
  }

  // Classify data
  for (const run of runs) {
    const date = new Date(run.workflow_started_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (monthlyData.has(monthKey)) {
      monthlyData.get(monthKey)!.push(run);
    }
  }

  // Calculate monthly cost
  const trend: CostTrendData[] = [];
  for (const [month, monthRuns] of monthlyData) {
    let inputCost = 0;
    let outputCost = 0;

    for (const run of monthRuns) {
      const cost = calculateRunCost(run);
      inputCost += cost.inputCost;
      outputCost += cost.outputCost;
    }

    trend.push({
      period: month,
      inputCost: Math.round(inputCost * 100) / 100,
      outputCost: Math.round(outputCost * 100) / 100,
      totalCost: Math.round((inputCost + outputCost) * 100) / 100,
    });
  }

  return trend;
}

/**
 * Generate daily cost trend data
 */
export function calculateDailyCostTrend(
  runs: WorkflowRun[],
  days: number = 14
): CostTrendData[] {
  const now = new Date();
  const dailyData: Map<string, WorkflowRun[]> = new Map();

  // Initialize last N days
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dateKey = targetDate.toISOString().split("T")[0];
    dailyData.set(dateKey, []);
  }

  // Classify data
  for (const run of runs) {
    const dateKey = run.workflow_started_at.split("T")[0];

    if (dailyData.has(dateKey)) {
      dailyData.get(dateKey)!.push(run);
    }
  }

  // Calculate daily cost
  const trend: CostTrendData[] = [];
  for (const [date, dayRuns] of dailyData) {
    let inputCost = 0;
    let outputCost = 0;

    for (const run of dayRuns) {
      const cost = calculateRunCost(run);
      inputCost += cost.inputCost;
      outputCost += cost.outputCost;
    }

    trend.push({
      period: date,
      inputCost: Math.round(inputCost * 100) / 100,
      outputCost: Math.round(outputCost * 100) / 100,
      totalCost: Math.round((inputCost + outputCost) * 100) / 100,
    });
  }

  return trend;
}

/**
 * Fetch total cumulative metrics (all time)
 */
export async function fetchTotalMetrics() {
  const runs = await fetchWorkflowRuns();
  if (runs.length === 0) {
    return null;
  }

  const metrics = calculateUniqueIssueMetrics(runs);
  const monthlyTrend = calculateMonthlyTrend(runs, 6);

  return {
    ...metrics,
    monthlyTrend,
  };
}

/**
 * Fetch metrics for a specific date range
 */
export async function fetchMetricsForPeriod(
  startDate: string,
  endDate: string
) {
  const runs = await fetchWorkflowRuns(startDate, endDate);
  if (runs.length === 0) {
    return null;
  }

  return calculateUniqueIssueMetrics(runs);
}

/**
 * Fetch daily trend for the dashboard
 */
export async function fetchDailyTrendData(
  days: number = 14
): Promise<TrendData[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  const runs = await fetchWorkflowRuns(startDate.toISOString().split("T")[0]);
  return calculateDailyTrend(runs, days);
}

/**
 * Fetch monthly trend for the public page
 */
export async function fetchMonthlyTrendData(
  months: number = 6
): Promise<TrendData[]> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const runs = await fetchWorkflowRuns(startDate.toISOString().split("T")[0]);
  return calculateMonthlyTrend(runs, months);
}
