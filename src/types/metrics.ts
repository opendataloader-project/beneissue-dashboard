// Database types (mirror of Supabase tables)
export interface WorkflowRun {
  id: string;
  repo: string;
  issue_number: number;
  workflow_type: "triage" | "analyze" | "fix" | "full";
  issue_created_at: string | null;
  workflow_started_at: string;
  workflow_completed_at: string | null;
  triage_decision: "valid" | "invalid" | "duplicate" | "needs_info" | null;
  triage_reason: string | null;
  duplicate_of: number | null;
  fix_decision: "auto_eligible" | "manual_required" | "comment_only" | null;
  priority: "P0" | "P1" | "P2" | null;
  story_points: number | null;
  assignee: string | null;
  fix_success: boolean | null;
  pr_url: string | null;
  fix_error: string | null;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  created_at: string;
}

export interface DailyMetrics {
  id: string;
  date: string;
  repo: string | null;
  total_runs: number;
  unique_issues: number;
  triage_count: number;
  analyze_count: number;
  fix_count: number;
  ai_filtered_count: number;
  valid_count: number;
  duplicate_count: number;
  needs_info_count: number;
  fix_attempted_count: number;
  fix_success_count: number;
  comment_only_count: number;
  avg_first_response_seconds: number | null;
  min_first_response_seconds: number | null;
  max_first_response_seconds: number | null;
  total_input_tokens: number;
  total_output_tokens: number;
  total_input_cost: number;
  total_output_cost: number;
  created_at: string;
  updated_at: string;
}

// Computed metrics for pages
export interface PublicMetrics {
  totalIssuesProcessed: number;
  avgResponseTimeSeconds: number;
  autoResolutionRate: number;
  totalCostUSD: number;
  monthlyTrend: MonthlyData[];
}

// Legacy interfaces (kept for backwards compatibility during migration)
export interface ExecutiveMetrics {
  roi: number;
  roiDelta: number;
  timeSavedHours: number;
  timeSavedDelta: number;
  costSavingsKRW: number;
  costSavingsDelta: number;
  issuesProcessed: number;
  issuesProcessedDelta: number;
  monthlyTrend: MonthlyData[];
  processingDistribution: ProcessingDistribution;
  summaryText: string;
}

export interface OperationsMetrics {
  aiFilteringRate: number;
  aiFilteringDelta: number;
  autoResolutionRate: number;
  autoResolutionDelta: number;
  avgResponseTimeSeconds: number;
  avgResponseTimeDelta: number;
  totalCostUSD: number;
  totalCostDelta: number;
  dailyTrend: DailyData[];
  decisionDistribution: DecisionDistribution;
  processingTimes: ProcessingTimes;
}

// New unified dashboard metrics (fact-based)
export interface DashboardMetrics {
  // Core KPIs
  totalIssuesProcessed: number;
  totalIssuesDelta: number;
  autoResolutionRate: number;
  autoResolutionDelta: number;
  avgResponseTimeSeconds: number;
  avgResponseTimeDelta: number;
  totalCostUSD: number;
  totalCostDelta: number;
  costPerIssueUSD: number;

  // Charts data
  dailyTrend: DailyData[];
  decisionDistribution: DecisionDistribution;
  processingTimes: ProcessingTimes;
}

// Period filter type
export type PeriodFilter =
  | "today"
  | "this_week"
  | "this_month"
  | "last_90_days"
  | "last_year"
  | "all";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MonthlyData {
  month: string;
  issuesProcessed: number;
  costSavings: number;
  timeSavedHours: number;
  roi: number;
}

export interface DailyData {
  date: string;
  triageCount: number;
  analyzeCount: number;
  fixCount: number;
  filteringRate: number;
}

export interface ProcessingDistribution {
  triage: number;
  analyze: number;
  fix: number;
}

export interface DecisionDistribution {
  valid: number;
  invalid: number;
  duplicate: number;
  needsInfo: number;
}

export interface ProcessingTimes {
  triageSeconds: number;
  analyzeSeconds: number;
  fixSeconds: number;
}
