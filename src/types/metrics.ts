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

// Computed metrics for Public Stats page (/)
export interface PublicMetrics {
  totalIssuesProcessed: number; // 유니크 이슈 수
  avgResponseTimeSeconds: number; // 평균 응답 시간
  autoResolutionRate: number; // 자동 해결율 (%)
  costPerIssueUSD: number; // 건당 AI 비용
  monthlyTrend: TrendData[]; // 월별 추이
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
  trendData: TrendData[]; // 추이 차트 데이터
  resolutionDistribution: ResolutionDistribution; // 결과 분포 (자동해결/수동필요)
}

// 추이 차트 데이터 (Stacked Bar + Line)
export interface TrendData {
  period: string; // 날짜 또는 월 (e.g., "2025-01" or "2025-01-15")
  autoResolved: number; // 자동 해결 건수
  manualRequired: number; // 수동 필요 건수
  autoResolutionRate: number; // 자동 해결율 (%)
}

// 결과 분포 (2분류)
export interface ResolutionDistribution {
  autoResolved: number; // 자동 해결
  manualRequired: number; // 수동 필요
}

// Period filter type
export type PeriodFilter =
  | "1week"
  | "1month"
  | "90days"
  | "1year"
  | "all";

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
