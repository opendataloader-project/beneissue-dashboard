// Database types (mirror of Supabase tables)
export interface WorkflowRun {
  id: string;
  repo: string;
  issue_number: number;
  workflow_type: "triage" | "analyze" | "fix";
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
  created_at: string;
}

// Computed metrics for Public Stats page (/)
export interface PublicMetrics {
  totalIssuesProcessed: number; // Unique issue count
  avgResponseTimeSeconds: number; // Average response time
  autoResolutionRate: number; // Auto resolution rate (%)
  costPerIssueUSD: number; // AI cost per issue
  monthlyTrend: TrendData[]; // Monthly trend
}

// Computed metrics for Dashboard page (/dashboard)
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
  trendData: TrendData[]; // Trend chart data
  costTrendData: CostTrendData[]; // Cost trend chart data
  resolutionDistribution: ResolutionDistribution; // Resolution distribution (auto-resolved/manual-required)
}

// Trend chart data (Stacked Bar + Line)
export interface TrendData {
  period: string; // Date or month (e.g., "2025-01" or "2025-01-15")
  autoResolved: number; // Auto-resolved count
  manualRequired: number; // Manual required count
  autoResolutionRate: number; // Auto resolution rate (%)
}

// Cost trend chart data (Stacked Bar)
export interface CostTrendData {
  period: string; // Date or month (e.g., "2025-01" or "2025-01-15")
  inputCost: number; // Input tokens cost
  outputCost: number; // Output tokens cost
  totalCost: number; // Total cost
}

// Resolution distribution (2 categories)
export interface ResolutionDistribution {
  autoResolved: number; // Auto-resolved
  manualRequired: number; // Manual required
}

// Period filter type
export type PeriodFilter =
  | "1week"
  | "1month"
  | "90days"
  | "1year"
  | "all"
  | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Legacy types for backwards compatibility during migration
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
