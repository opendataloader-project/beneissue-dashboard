import type {
  CostTrendData,
  DashboardMetrics,
  PublicMetrics,
  TrendData,
} from "@/types/metrics";
import type {
  ROIMetrics,
  ROITrendData,
  SavingsBreakdownData,
} from "@/types/roi";

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
  {
    period: "2025-12-15",
    autoResolved: 9,
    manualRequired: 3,
    autoResolutionRate: 75.0,
  },
  {
    period: "2025-12-16",
    autoResolved: 7,
    manualRequired: 3,
    autoResolutionRate: 70.0,
  },
  {
    period: "2025-12-17",
    autoResolved: 11,
    manualRequired: 3,
    autoResolutionRate: 78.6,
  },
  {
    period: "2025-12-18",
    autoResolved: 7,
    manualRequired: 2,
    autoResolutionRate: 77.8,
  },
  {
    period: "2025-12-19",
    autoResolved: 12,
    manualRequired: 3,
    autoResolutionRate: 80.0,
  },
  {
    period: "2025-12-20",
    autoResolved: 9,
    manualRequired: 2,
    autoResolutionRate: 81.8,
  },
  {
    period: "2025-12-21",
    autoResolved: 6,
    manualRequired: 2,
    autoResolutionRate: 75.0,
  },
  {
    period: "2025-12-22",
    autoResolved: 8,
    manualRequired: 2,
    autoResolutionRate: 80.0,
  },
  {
    period: "2025-12-23",
    autoResolved: 10,
    manualRequired: 3,
    autoResolutionRate: 76.9,
  },
  {
    period: "2025-12-24",
    autoResolved: 6,
    manualRequired: 2,
    autoResolutionRate: 75.0,
  },
  {
    period: "2025-12-25",
    autoResolved: 5,
    manualRequired: 2,
    autoResolutionRate: 71.4,
  },
  {
    period: "2025-12-26",
    autoResolved: 11,
    manualRequired: 3,
    autoResolutionRate: 78.6,
  },
  {
    period: "2025-12-27",
    autoResolved: 13,
    manualRequired: 3,
    autoResolutionRate: 81.3,
  },
  {
    period: "2025-12-28",
    autoResolved: 14,
    manualRequired: 3,
    autoResolutionRate: 82.4,
  },
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
const latestAutoResolved = latestMonthData.reduce(
  (sum, d) => sum + d.autoResolved,
  0
);
const latestManualRequired = latestMonthData.reduce(
  (sum, d) => sum + d.manualRequired,
  0
);
const latestTotal = latestAutoResolved + latestManualRequired;

export const mockDashboardMetrics: DashboardMetrics = {
  totalIssuesProcessed: latestTotal, // 128
  totalIssuesDelta: 12,
  autoResolutionRate:
    Math.round((latestAutoResolved / latestTotal) * 1000) / 10, // 78.1%
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

// ROI Simulator Mock Data (/roi-simulator)
// 기준: 응용SW개발자 시급 $30.09 (USD), all values in USD
const mockROITrendData: ROITrendData[] = [
  {
    period: "2025-07",
    humanCostSaved: 4263.54,
    aiCost: 16.52,
    netSavings: 4247.02,
    roiPercentage: 25610.5,
    issueCount: 118,
  },
  {
    period: "2025-08",
    humanCostSaved: 3902.33,
    aiCost: 15.2,
    netSavings: 3887.13,
    roiPercentage: 25476.4,
    issueCount: 108,
  },
  {
    period: "2025-09",
    humanCostSaved: 3685.59,
    aiCost: 14.36,
    netSavings: 3671.23,
    roiPercentage: 25466.2,
    issueCount: 102,
  },
  {
    period: "2025-10",
    humanCostSaved: 3432.61,
    aiCost: 13.38,
    netSavings: 3419.23,
    roiPercentage: 25460.8,
    issueCount: 95,
  },
  {
    period: "2025-11",
    humanCostSaved: 3179.63,
    aiCost: 12.4,
    netSavings: 3167.23,
    roiPercentage: 25437.1,
    issueCount: 88,
  },
  {
    period: "2025-12",
    humanCostSaved: 5348.29,
    aiCost: 20.84,
    netSavings: 5327.45,
    roiPercentage: 25463.7,
    issueCount: 148,
  },
];

const mockSavingsBreakdown: SavingsBreakdownData[] = [
  {
    storyPoints: 1,
    issueCount: 45,
    totalHours: 180,
    totalSavings: 5416.2,
    percentage: 8.2,
  },
  {
    storyPoints: 2,
    issueCount: 312,
    totalHours: 3744,
    totalSavings: 112675.68,
    percentage: 56.4,
  },
  {
    storyPoints: 3,
    issueCount: 156,
    totalHours: 4992,
    totalSavings: 150209.28,
    percentage: 22.8,
  },
  {
    storyPoints: 5,
    issueCount: 42,
    totalHours: 2688,
    totalSavings: 80882.08,
    percentage: 10.1,
  },
  {
    storyPoints: 8,
    issueCount: 12,
    totalHours: 1152,
    totalSavings: 34663.68,
    percentage: 2.5,
  },
];

export const mockROIMetrics: ROIMetrics = {
  totalAutoResolvedIssues: 659,
  totalStoryPoints: 1318,
  totalEstimatedHours: 12756,
  totalHumanCostSaved: 383891.48,
  totalAICost: 92.7,
  netSavings: 383798.78,
  roiPercentage: 413921.8,
  avgSavingsPerIssue: 582.54,
  avgAICostPerIssue: 0.14,
  monthlyTrend: mockROITrendData,
  savingsBreakdown: mockSavingsBreakdown,
  savingsDelta: 12.3,
  roiDelta: 5.2,
};
