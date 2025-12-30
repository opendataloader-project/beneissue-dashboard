import type { PeriodFilter, DateRange } from "./metrics";

// Developer role types based on Korean SW Association 2025 rates
export type DeveloperRole =
  | "application_developer"    // 응용SW개발자
  | "system_developer"         // 시스템SW개발자
  | "it_pm"                    // IT PM
  | "it_architect"             // IT아키텍트
  | "data_analyst";            // 데이터분석가

export interface DeveloperRate {
  role: DeveloperRole;
  labelKo: string;
  labelEn: string;
  hourlyRateKRW: number;
  hourlyRateUSD: number;
}

// Story points to hours mapping
export interface StoryPointMapping {
  points: number;
  minDays: number;
  maxDays: number;
  avgHours: number;
  descriptionKo: string;
  descriptionEn: string;
}

// Aggregated ROI metrics for display
export interface ROIMetrics {
  // Summary metrics
  totalAutoResolvedIssues: number;
  totalStoryPoints: number;
  totalEstimatedHours: number;

  // Cost metrics (in USD)
  totalHumanCostSaved: number;
  totalAICost: number;
  netSavings: number;
  roiPercentage: number;

  // Per-issue averages
  avgSavingsPerIssue: number;
  avgAICostPerIssue: number;

  // Trend data
  monthlyTrend: ROITrendData[];

  // Breakdown data
  savingsBreakdown: SavingsBreakdownData[];

  // Delta vs previous period
  savingsDelta?: number;
  roiDelta?: number;
}

export interface ROITrendData {
  period: string;           // YYYY-MM or YYYY-MM-DD
  humanCostSaved: number;   // USD
  aiCost: number;           // USD
  netSavings: number;       // USD
  roiPercentage: number;
  issueCount: number;
}

export interface SavingsBreakdownData {
  storyPoints: number;
  issueCount: number;
  totalHours: number;
  totalSavings: number;
  percentage: number;
}

// Input parameters for ROI calculation
export interface ROICalculationParams {
  developerRole: DeveloperRole;
  period: PeriodFilter;
  customRange?: DateRange;
  repo?: string;
  usdToKrwRate?: number;
}
