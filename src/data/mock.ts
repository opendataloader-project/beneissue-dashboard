import type {
  DailyData,
  DashboardMetrics,
  ExecutiveMetrics,
  MonthlyData,
  OperationsMetrics,
  PublicMetrics,
} from "@/types/metrics";

// Fixed monthly trend data for the past 6 months
const monthlyTrendData: MonthlyData[] = [
  {
    month: "2025-07",
    issuesProcessed: 165,
    costSavings: 875000,
    timeSavedHours: 20,
    roi: 880,
  },
  {
    month: "2025-08",
    issuesProcessed: 152,
    costSavings: 810000,
    timeSavedHours: 18,
    roi: 850,
  },
  {
    month: "2025-09",
    issuesProcessed: 138,
    costSavings: 735000,
    timeSavedHours: 17,
    roi: 820,
  },
  {
    month: "2025-10",
    issuesProcessed: 124,
    costSavings: 660000,
    timeSavedHours: 15,
    roi: 790,
  },
  {
    month: "2025-11",
    issuesProcessed: 110,
    costSavings: 585000,
    timeSavedHours: 13,
    roi: 760,
  },
  {
    month: "2025-12",
    issuesProcessed: 185,
    costSavings: 985000,
    timeSavedHours: 22,
    roi: 920,
  },
];

// Fixed daily trend data for the past 14 days
const dailyTrendData: DailyData[] = [
  {
    date: "2025-12-15",
    triageCount: 12,
    analyzeCount: 9,
    fixCount: 4,
    filteringRate: 28,
  },
  {
    date: "2025-12-16",
    triageCount: 10,
    analyzeCount: 8,
    fixCount: 3,
    filteringRate: 25,
  },
  {
    date: "2025-12-17",
    triageCount: 14,
    analyzeCount: 10,
    fixCount: 4,
    filteringRate: 30,
  },
  {
    date: "2025-12-18",
    triageCount: 9,
    analyzeCount: 7,
    fixCount: 3,
    filteringRate: 22,
  },
  {
    date: "2025-12-19",
    triageCount: 15,
    analyzeCount: 11,
    fixCount: 5,
    filteringRate: 32,
  },
  {
    date: "2025-12-20",
    triageCount: 11,
    analyzeCount: 8,
    fixCount: 3,
    filteringRate: 26,
  },
  {
    date: "2025-12-21",
    triageCount: 8,
    analyzeCount: 6,
    fixCount: 2,
    filteringRate: 20,
  },
  {
    date: "2025-12-22",
    triageCount: 10,
    analyzeCount: 7,
    fixCount: 3,
    filteringRate: 24,
  },
  {
    date: "2025-12-23",
    triageCount: 13,
    analyzeCount: 9,
    fixCount: 4,
    filteringRate: 29,
  },
  {
    date: "2025-12-24",
    triageCount: 8,
    analyzeCount: 6,
    fixCount: 2,
    filteringRate: 21,
  },
  {
    date: "2025-12-25",
    triageCount: 7,
    analyzeCount: 5,
    fixCount: 2,
    filteringRate: 18,
  },
  {
    date: "2025-12-26",
    triageCount: 14,
    analyzeCount: 10,
    fixCount: 4,
    filteringRate: 31,
  },
  {
    date: "2025-12-27",
    triageCount: 16,
    analyzeCount: 11,
    fixCount: 5,
    filteringRate: 33,
  },
  {
    date: "2025-12-28",
    triageCount: 17,
    analyzeCount: 12,
    fixCount: 5,
    filteringRate: 35,
  },
];

const monthlyTrend = monthlyTrendData;
const dailyTrend = dailyTrendData;

// Calculate totals from monthly data
const totalIssues = monthlyTrend.reduce((sum, m) => sum + m.issuesProcessed, 0);
const latestMonth = monthlyTrend[monthlyTrend.length - 1];
const previousMonth = monthlyTrend[monthlyTrend.length - 2];

export const mockPublicMetrics: PublicMetrics = {
  totalIssuesProcessed: totalIssues,
  avgResponseTimeSeconds: 45,
  autoResolutionRate: 32.5,
  totalCostUSD: 15.8,
  monthlyTrend,
};

// Legacy mock data (kept for backwards compatibility)
export const mockExecutiveMetrics: ExecutiveMetrics = {
  roi: latestMonth.roi,
  roiDelta: ((latestMonth.roi - previousMonth.roi) / previousMonth.roi) * 100,
  timeSavedHours: latestMonth.timeSavedHours,
  timeSavedDelta:
    ((latestMonth.timeSavedHours - previousMonth.timeSavedHours) /
      previousMonth.timeSavedHours) *
    100,
  costSavingsKRW: latestMonth.costSavings,
  costSavingsDelta:
    ((latestMonth.costSavings - previousMonth.costSavings) /
      previousMonth.costSavings) *
    100,
  issuesProcessed: latestMonth.issuesProcessed,
  issuesProcessedDelta:
    ((latestMonth.issuesProcessed - previousMonth.issuesProcessed) /
      previousMonth.issuesProcessed) *
    100,
  monthlyTrend,
  processingDistribution: {
    triage: latestMonth.issuesProcessed,
    analyze: Math.floor(latestMonth.issuesProcessed * 0.72),
    fix: Math.floor(latestMonth.issuesProcessed * 0.28),
  },
  summaryText: `이번 달 AI가 ${latestMonth.issuesProcessed.toLocaleString()}건 처리, ${latestMonth.timeSavedHours}시간 절약, ROI ${latestMonth.roi}%`,
};

export const mockOperationsMetrics: OperationsMetrics = {
  aiFilteringRate: 28.5,
  aiFilteringDelta: 5.2,
  autoResolutionRate: 35.2,
  autoResolutionDelta: 8.1,
  avgResponseTimeSeconds: 45,
  avgResponseTimeDelta: -12.3,
  totalCostUSD: 15.8,
  totalCostDelta: 3.2,
  dailyTrend,
  decisionDistribution: {
    valid: Math.floor(latestMonth.issuesProcessed * 0.72),
    invalid: Math.floor(latestMonth.issuesProcessed * 0.14),
    duplicate: Math.floor(latestMonth.issuesProcessed * 0.1),
    needsInfo: Math.floor(latestMonth.issuesProcessed * 0.04),
  },
  processingTimes: {
    triageSeconds: 12,
    analyzeSeconds: 45,
    fixSeconds: 180,
  },
};

// New unified dashboard mock data (fact-based)
export const mockDashboardMetrics: DashboardMetrics = {
  totalIssuesProcessed: latestMonth.issuesProcessed,
  totalIssuesDelta: Math.round(
    ((latestMonth.issuesProcessed - previousMonth.issuesProcessed) /
      previousMonth.issuesProcessed) *
      100
  ),
  autoResolutionRate: 32.5,
  autoResolutionDelta: 5.2,
  avgResponseTimeSeconds: 45,
  avgResponseTimeDelta: -12.3,
  totalCostUSD: 15.8,
  totalCostDelta: 8.5,
  costPerIssueUSD: 0.085,
  dailyTrend,
  decisionDistribution: {
    valid: Math.floor(latestMonth.issuesProcessed * 0.72),
    invalid: Math.floor(latestMonth.issuesProcessed * 0.14),
    duplicate: Math.floor(latestMonth.issuesProcessed * 0.1),
    needsInfo: Math.floor(latestMonth.issuesProcessed * 0.04),
  },
  processingTimes: {
    triageSeconds: 12,
    analyzeSeconds: 45,
    fixSeconds: 180,
  },
};
