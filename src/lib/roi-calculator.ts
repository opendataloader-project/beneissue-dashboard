import type { WorkflowRun } from "@/types/metrics";
import type {
  DeveloperRole,
  ROIMetrics,
  ROITrendData,
  SavingsBreakdownData,
} from "@/types/roi";
import {
  DEVELOPER_RATES,
  DEFAULT_STORY_POINTS,
  getHoursFromStoryPoints,
} from "@/data/developer-rates";

// Token pricing per million tokens (MTok) - mirrored from db.ts
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
 * Calculate cost in USD based on workflow_type and token counts
 */
function calculateRunCostUSD(run: WorkflowRun): number {
  const pricing =
    run.workflow_type === "triage"
      ? PRICING["claude-haiku-4-5"]
      : PRICING["claude-sonnet-4-5"];

  const inputCost = (run.input_tokens / 1_000_000) * pricing.input;
  const outputCost = (run.output_tokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * 자동 해결 조건 체크
 */
function isAutoResolved(run: WorkflowRun): boolean {
  return run.fix_decision !== "manual_required";
}

/**
 * 유니크 이슈 키 생성
 */
function getUniqueIssueKey(run: WorkflowRun): string {
  return `${run.repo}:${run.issue_number}`;
}

interface IssueData {
  repo: string;
  issueNumber: number;
  storyPoints: number;
  aiCostUSD: number;
  isAutoResolved: boolean;
  period: string; // YYYY-MM for monthly trend
}

/**
 * Group workflow runs by unique issue (auto-resolved only)
 */
function groupAutoResolvedIssues(runs: WorkflowRun[]): Map<string, IssueData> {
  const issueMap = new Map<string, IssueData>();

  for (const run of runs) {
    const key = getUniqueIssueKey(run);

    if (!issueMap.has(key)) {
      const date = new Date(run.workflow_started_at);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      issueMap.set(key, {
        repo: run.repo,
        issueNumber: run.issue_number,
        storyPoints: run.story_points ?? DEFAULT_STORY_POINTS,
        aiCostUSD: 0,
        isAutoResolved: false,
        period,
      });
    }

    const issue = issueMap.get(key)!;
    issue.aiCostUSD += calculateRunCostUSD(run);

    // Update story points if available (use latest non-null value)
    if (run.story_points !== null) {
      issue.storyPoints = run.story_points;
    }

    // Mark as auto-resolved if any run is auto-resolved
    if (isAutoResolved(run)) {
      issue.isAutoResolved = true;
    }
  }

  // Filter to only auto-resolved issues
  const autoResolvedIssues = new Map<string, IssueData>();
  for (const [key, issue] of issueMap) {
    if (issue.isAutoResolved) {
      autoResolvedIssues.set(key, issue);
    }
  }

  return autoResolvedIssues;
}

/**
 * Calculate monthly ROI trend data (all values in USD)
 */
function calculateMonthlyROITrend(
  issues: Map<string, IssueData>,
  hourlyRateUSD: number,
  months: number = 12
): ROITrendData[] {
  const now = new Date();
  const monthlyData: Map<
    string,
    { issues: IssueData[]; humanCostUSD: number; aiCostUSD: number }
  > = new Map();

  // Initialize months
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(monthKey, { issues: [], humanCostUSD: 0, aiCostUSD: 0 });
  }

  // Group issues by month
  for (const issue of issues.values()) {
    if (monthlyData.has(issue.period)) {
      const monthData = monthlyData.get(issue.period)!;
      monthData.issues.push(issue);

      const estimatedHours = getHoursFromStoryPoints(issue.storyPoints);
      monthData.humanCostUSD += estimatedHours * hourlyRateUSD;
      monthData.aiCostUSD += issue.aiCostUSD;
    }
  }

  // Build trend data (all in USD)
  const trend: ROITrendData[] = [];
  for (const [period, data] of monthlyData) {
    const netSavings = data.humanCostUSD - data.aiCostUSD;
    const roiPercentage = data.aiCostUSD > 0 ? (netSavings / data.aiCostUSD) * 100 : 0;

    trend.push({
      period,
      humanCostSaved: Math.round(data.humanCostUSD * 100) / 100,
      aiCost: Math.round(data.aiCostUSD * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      roiPercentage: Math.round(roiPercentage * 10) / 10,
      issueCount: data.issues.length,
    });
  }

  return trend;
}

/**
 * Calculate savings breakdown by story points (all values in USD)
 */
function calculateSavingsBreakdown(
  issues: Map<string, IssueData>,
  hourlyRateUSD: number
): SavingsBreakdownData[] {
  const breakdownMap = new Map<
    number,
    { count: number; hours: number; savingsUSD: number }
  >();

  let totalSavingsUSD = 0;

  for (const issue of issues.values()) {
    const sp = issue.storyPoints;
    const hours = getHoursFromStoryPoints(sp);
    const savingsUSD = hours * hourlyRateUSD;

    if (!breakdownMap.has(sp)) {
      breakdownMap.set(sp, { count: 0, hours: 0, savingsUSD: 0 });
    }

    const data = breakdownMap.get(sp)!;
    data.count++;
    data.hours += hours;
    data.savingsUSD += savingsUSD;
    totalSavingsUSD += savingsUSD;
  }

  const breakdown: SavingsBreakdownData[] = [];
  for (const [sp, data] of breakdownMap) {
    breakdown.push({
      storyPoints: sp,
      issueCount: data.count,
      totalHours: data.hours,
      totalSavings: Math.round(data.savingsUSD * 100) / 100,
      percentage:
        totalSavingsUSD > 0
          ? Math.round((data.savingsUSD / totalSavingsUSD) * 1000) / 10
          : 0,
    });
  }

  // Sort by story points
  breakdown.sort((a, b) => a.storyPoints - b.storyPoints);

  return breakdown;
}

/**
 * Main ROI calculation function (all values in USD)
 */
export function calculateROIMetrics(
  runs: WorkflowRun[],
  developerRole: DeveloperRole
): ROIMetrics {
  const hourlyRateUSD = DEVELOPER_RATES[developerRole].hourlyRateUSD;

  // Group by unique issue and filter to auto-resolved only
  const issues = groupAutoResolvedIssues(runs);

  let totalStoryPoints = 0;
  let totalEstimatedHours = 0;
  let totalHumanCostSavedUSD = 0;
  let totalAICostUSD = 0;

  for (const issue of issues.values()) {
    const estimatedHours = getHoursFromStoryPoints(issue.storyPoints);

    totalStoryPoints += issue.storyPoints;
    totalEstimatedHours += estimatedHours;
    totalHumanCostSavedUSD += estimatedHours * hourlyRateUSD;
    totalAICostUSD += issue.aiCostUSD;
  }

  // All calculations in USD
  const netSavingsUSD = totalHumanCostSavedUSD - totalAICostUSD;
  const roiPercentage =
    totalAICostUSD > 0 ? (netSavingsUSD / totalAICostUSD) * 100 : 0;

  const issueCount = issues.size;

  return {
    totalAutoResolvedIssues: issueCount,
    totalStoryPoints,
    totalEstimatedHours,
    totalHumanCostSaved: Math.round(totalHumanCostSavedUSD * 100) / 100,
    totalAICost: Math.round(totalAICostUSD * 100) / 100,
    netSavings: Math.round(netSavingsUSD * 100) / 100,
    roiPercentage: Math.round(roiPercentage * 10) / 10,
    avgSavingsPerIssue:
      issueCount > 0 ? Math.round((totalHumanCostSavedUSD / issueCount) * 100) / 100 : 0,
    avgAICostPerIssue:
      issueCount > 0 ? Math.round((totalAICostUSD / issueCount) * 100) / 100 : 0,
    monthlyTrend: calculateMonthlyROITrend(issues, hourlyRateUSD),
    savingsBreakdown: calculateSavingsBreakdown(issues, hourlyRateUSD),
  };
}

/**
 * Calculate delta percentage between current and previous values
 */
export function calculateDelta(
  current: number,
  previous: number
): number | undefined {
  if (previous === 0) {
    return current > 0 ? 100 : undefined;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}
