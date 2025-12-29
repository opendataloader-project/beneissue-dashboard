import type {
  DashboardMetrics,
  PublicMetrics,
  TrendData,
  CostTrendData,
} from "@/types/metrics";

// 기획서 정의에 따른 Mock 데이터
// 자동 해결: triage_decision IN ('invalid', 'duplicate', 'needs_info')
//           OR fix_success = true OR fix_decision = 'comment_only'

// 월별 추이 데이터 (최근 6개월)
const monthlyTrendData: TrendData[] = [
  {
    period: "2025-07",
    autoResolved: 118, // 72%
    manualRequired: 47,
    autoResolutionRate: 71.5,
  },
  {
    period: "2025-08",
    autoResolved: 108, // 71%
    manualRequired: 44,
    autoResolutionRate: 71.1,
  },
  {
    period: "2025-09",
    autoResolved: 102, // 74%
    manualRequired: 36,
    autoResolutionRate: 73.9,
  },
  {
    period: "2025-10",
    autoResolved: 95, // 77%
    manualRequired: 29,
    autoResolutionRate: 76.6,
  },
  {
    period: "2025-11",
    autoResolved: 88, // 80%
    manualRequired: 22,
    autoResolutionRate: 80.0,
  },
  {
    period: "2025-12",
    autoResolved: 148, // 80%
    manualRequired: 37,
    autoResolutionRate: 80.0,
  },
];

// 일별 추이 데이터 (최근 14일)
const dailyTrendData: TrendData[] = [
  { period: "2025-12-15", autoResolved: 9, manualRequired: 3, autoResolutionRate: 75.0 },
  { period: "2025-12-16", autoResolved: 7, manualRequired: 3, autoResolutionRate: 70.0 },
  { period: "2025-12-17", autoResolved: 11, manualRequired: 3, autoResolutionRate: 78.6 },
  { period: "2025-12-18", autoResolved: 7, manualRequired: 2, autoResolutionRate: 77.8 },
  { period: "2025-12-19", autoResolved: 12, manualRequired: 3, autoResolutionRate: 80.0 },
  { period: "2025-12-20", autoResolved: 9, manualRequired: 2, autoResolutionRate: 81.8 },
  { period: "2025-12-21", autoResolved: 6, manualRequired: 2, autoResolutionRate: 75.0 },
  { period: "2025-12-22", autoResolved: 8, manualRequired: 2, autoResolutionRate: 80.0 },
  { period: "2025-12-23", autoResolved: 10, manualRequired: 3, autoResolutionRate: 76.9 },
  { period: "2025-12-24", autoResolved: 6, manualRequired: 2, autoResolutionRate: 75.0 },
  { period: "2025-12-25", autoResolved: 5, manualRequired: 2, autoResolutionRate: 71.4 },
  { period: "2025-12-26", autoResolved: 11, manualRequired: 3, autoResolutionRate: 78.6 },
  { period: "2025-12-27", autoResolved: 13, manualRequired: 3, autoResolutionRate: 81.3 },
  { period: "2025-12-28", autoResolved: 14, manualRequired: 3, autoResolutionRate: 82.4 },
];

// 일별 비용 추이 데이터 (최근 14일)
const dailyCostTrendData: CostTrendData[] = [
  { period: "2025-12-15", inputCost: 2.15, outputCost: 1.69, totalCost: 3.84 },
  { period: "2025-12-16", inputCost: 1.82, outputCost: 1.38, totalCost: 3.2 },
  { period: "2025-12-17", inputCost: 2.56, outputCost: 1.92, totalCost: 4.48 },
  { period: "2025-12-18", inputCost: 1.65, outputCost: 1.23, totalCost: 2.88 },
  { period: "2025-12-19", inputCost: 2.74, outputCost: 2.06, totalCost: 4.8 },
  { period: "2025-12-20", inputCost: 2.01, outputCost: 1.51, totalCost: 3.52 },
  { period: "2025-12-21", inputCost: 1.46, outputCost: 1.1, totalCost: 2.56 },
  { period: "2025-12-22", inputCost: 1.83, outputCost: 1.37, totalCost: 3.2 },
  { period: "2025-12-23", inputCost: 2.37, outputCost: 1.79, totalCost: 4.16 },
  { period: "2025-12-24", inputCost: 1.46, outputCost: 1.1, totalCost: 2.56 },
  { period: "2025-12-25", inputCost: 1.28, outputCost: 0.96, totalCost: 2.24 },
  { period: "2025-12-26", inputCost: 2.56, outputCost: 1.92, totalCost: 4.48 },
  { period: "2025-12-27", inputCost: 2.92, outputCost: 2.2, totalCost: 5.12 },
  { period: "2025-12-28", inputCost: 3.1, outputCost: 2.34, totalCost: 5.44 },
];

// Calculate totals from monthly data
const totalIssues = monthlyTrendData.reduce(
  (sum, m) => sum + m.autoResolved + m.manualRequired,
  0
);
const totalAutoResolved = monthlyTrendData.reduce(
  (sum, m) => sum + m.autoResolved,
  0
);

// Public Stats Mock Data (/)
export const mockPublicMetrics: PublicMetrics = {
  totalIssuesProcessed: totalIssues, // 874
  avgResponseTimeSeconds: 45,
  autoResolutionRate: Math.round((totalAutoResolved / totalIssues) * 1000) / 10, // 75.3%
  costPerIssueUSD: 0.32,
  monthlyTrend: monthlyTrendData,
};

// Dashboard Mock Data (/dashboard)
const latestMonthData = dailyTrendData.slice(-14);
const latestAutoResolved = latestMonthData.reduce((sum, d) => sum + d.autoResolved, 0);
const latestManualRequired = latestMonthData.reduce((sum, d) => sum + d.manualRequired, 0);
const latestTotal = latestAutoResolved + latestManualRequired;

export const mockDashboardMetrics: DashboardMetrics = {
  totalIssuesProcessed: latestTotal, // 128
  totalIssuesDelta: 12,
  autoResolutionRate: Math.round((latestAutoResolved / latestTotal) * 1000) / 10, // 78.1%
  autoResolutionDelta: 5.2,
  avgResponseTimeSeconds: 45,
  avgResponseTimeDelta: -12.3,
  totalCostUSD: Math.round(latestTotal * 0.32 * 100) / 100, // $40.96
  totalCostDelta: 8.5,
  costPerIssueUSD: 0.32,
  trendData: dailyTrendData,
  costTrendData: dailyCostTrendData,
  resolutionDistribution: {
    autoResolved: latestAutoResolved,
    manualRequired: latestManualRequired,
  },
};
