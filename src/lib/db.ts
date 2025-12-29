import type { WorkflowRun, TrendData, ResolutionDistribution } from "@/types/metrics";
import { isSupabaseConfigured, supabase } from "./supabase";

/**
 * 자동 해결 조건 체크
 * 기획서 정의: triage_decision IN ('invalid', 'duplicate', 'needs_info')
 *            OR fix_success = true
 *            OR fix_decision = 'comment_only'
 */
function isAutoResolved(run: WorkflowRun): boolean {
  const triageAutoResolved =
    run.triage_decision === "invalid" ||
    run.triage_decision === "duplicate" ||
    run.triage_decision === "needs_info";

  const fixAutoResolved =
    run.fix_success === true ||
    run.fix_decision === "comment_only";

  return triageAutoResolved || fixAutoResolved;
}

/**
 * 유니크 이슈 키 생성
 */
function getUniqueIssueKey(run: WorkflowRun): string {
  return `${run.repo}:${run.issue_number}`;
}

/**
 * Fetch workflow runs for a date range
 */
export async function fetchWorkflowRuns(
  startDate?: string,
  endDate?: string
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

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching workflow runs:", error);
    return [];
  }

  return data || [];
}

/**
 * 유니크 이슈별 메트릭 계산
 * 동일 (repo, issue_number) 조합은 1건으로 카운트
 */
export function calculateUniqueIssueMetrics(runs: WorkflowRun[]) {
  const issueMap = new Map<string, {
    runs: WorkflowRun[];
    firstResponseSeconds: number | null;
    totalCost: number;
    isAutoResolved: boolean;
  }>();

  // 이슈별로 그룹화
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
    issue.totalCost += (run.input_cost || 0) + (run.output_cost || 0);

    // 자동 해결 여부 (하나라도 자동 해결 조건 만족하면 자동 해결)
    if (isAutoResolved(run)) {
      issue.isAutoResolved = true;
    }

    // 첫 응답 시간 계산 (이슈 생성 시점 ~ 첫 워크플로우 시작 시점)
    if (run.issue_created_at && run.workflow_started_at) {
      const issueCreated = new Date(run.issue_created_at).getTime();
      const workflowStarted = new Date(run.workflow_started_at).getTime();
      const responseSeconds = (workflowStarted - issueCreated) / 1000;

      if (issue.firstResponseSeconds === null || responseSeconds < issue.firstResponseSeconds) {
        issue.firstResponseSeconds = responseSeconds;
      }
    }
  }

  // 메트릭 계산
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
  const autoResolutionRate = uniqueIssues > 0 ? (autoResolvedCount / uniqueIssues) * 100 : 0;
  const avgResponseSeconds = responseCount > 0 ? totalResponseSeconds / responseCount : 0;
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
 * 월별 추이 데이터 생성
 */
export function calculateMonthlyTrend(runs: WorkflowRun[], months: number = 6): TrendData[] {
  const now = new Date();
  const monthlyData: Map<string, WorkflowRun[]> = new Map();

  // 최근 N개월 초기화
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(monthKey, []);
  }

  // 데이터 분류
  for (const run of runs) {
    const date = new Date(run.workflow_started_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (monthlyData.has(monthKey)) {
      monthlyData.get(monthKey)!.push(run);
    }
  }

  // 월별 메트릭 계산
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
 * 일별 추이 데이터 생성
 */
export function calculateDailyTrend(runs: WorkflowRun[], days: number = 14): TrendData[] {
  const now = new Date();
  const dailyData: Map<string, WorkflowRun[]> = new Map();

  // 최근 N일 초기화
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dateKey = targetDate.toISOString().split("T")[0];
    dailyData.set(dateKey, []);
  }

  // 데이터 분류
  for (const run of runs) {
    const dateKey = run.workflow_started_at.split("T")[0];

    if (dailyData.has(dateKey)) {
      dailyData.get(dateKey)!.push(run);
    }
  }

  // 일별 메트릭 계산
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
 * 결과 분포 계산
 */
export function calculateResolutionDistribution(runs: WorkflowRun[]): ResolutionDistribution {
  const metrics = calculateUniqueIssueMetrics(runs);
  return {
    autoResolved: metrics.autoResolvedCount,
    manualRequired: metrics.manualRequiredCount,
  };
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
export async function fetchMetricsForPeriod(startDate: string, endDate: string) {
  const runs = await fetchWorkflowRuns(startDate, endDate);
  if (runs.length === 0) {
    return null;
  }

  return calculateUniqueIssueMetrics(runs);
}

/**
 * Fetch daily trend for the dashboard
 */
export async function fetchDailyTrendData(days: number = 14): Promise<TrendData[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  const runs = await fetchWorkflowRuns(startDate.toISOString().split("T")[0]);
  return calculateDailyTrend(runs, days);
}

/**
 * Fetch monthly trend for the public page
 */
export async function fetchMonthlyTrendData(months: number = 6): Promise<TrendData[]> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const runs = await fetchWorkflowRuns(startDate.toISOString().split("T")[0]);
  return calculateMonthlyTrend(runs, months);
}
