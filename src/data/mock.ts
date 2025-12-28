import type {
  PublicMetrics,
  ExecutiveMetrics,
  OperationsMetrics,
  MonthlyData,
  DailyData,
} from '@/types/metrics';

// Fixed monthly trend data for the past 6 months
const monthlyTrendData: MonthlyData[] = [
  { month: '2025-07', issuesProcessed: 1650, costSavings: 8750000, timeSavedHours: 198, roi: 880 },
  { month: '2025-08', issuesProcessed: 1520, costSavings: 8100000, timeSavedHours: 182, roi: 850 },
  { month: '2025-09', issuesProcessed: 1380, costSavings: 7350000, timeSavedHours: 166, roi: 820 },
  { month: '2025-10', issuesProcessed: 1240, costSavings: 6600000, timeSavedHours: 149, roi: 790 },
  { month: '2025-11', issuesProcessed: 1100, costSavings: 5850000, timeSavedHours: 132, roi: 760 },
  { month: '2025-12', issuesProcessed: 1850, costSavings: 9850000, timeSavedHours: 222, roi: 920 },
];

// Fixed daily trend data for the past 14 days
const dailyTrendData: DailyData[] = [
  { date: '2025-12-15', triageCount: 42, analyzeCount: 29, fixCount: 12, filteringRate: 28 },
  { date: '2025-12-16', triageCount: 38, analyzeCount: 27, fixCount: 11, filteringRate: 25 },
  { date: '2025-12-17', triageCount: 45, analyzeCount: 32, fixCount: 13, filteringRate: 30 },
  { date: '2025-12-18', triageCount: 35, analyzeCount: 25, fixCount: 10, filteringRate: 22 },
  { date: '2025-12-19', triageCount: 48, analyzeCount: 34, fixCount: 14, filteringRate: 32 },
  { date: '2025-12-20', triageCount: 40, analyzeCount: 28, fixCount: 11, filteringRate: 26 },
  { date: '2025-12-21', triageCount: 32, analyzeCount: 22, fixCount: 9, filteringRate: 20 },
  { date: '2025-12-22', triageCount: 36, analyzeCount: 25, fixCount: 10, filteringRate: 24 },
  { date: '2025-12-23', triageCount: 44, analyzeCount: 31, fixCount: 12, filteringRate: 29 },
  { date: '2025-12-24', triageCount: 30, analyzeCount: 21, fixCount: 8, filteringRate: 21 },
  { date: '2025-12-25', triageCount: 28, analyzeCount: 20, fixCount: 8, filteringRate: 18 },
  { date: '2025-12-26', triageCount: 46, analyzeCount: 32, fixCount: 13, filteringRate: 31 },
  { date: '2025-12-27', triageCount: 50, analyzeCount: 35, fixCount: 14, filteringRate: 33 },
  { date: '2025-12-28', triageCount: 52, analyzeCount: 36, fixCount: 15, filteringRate: 35 },
];

const monthlyTrend = monthlyTrendData;
const dailyTrend = dailyTrendData;

// Calculate totals from monthly data
const totalIssues = monthlyTrend.reduce((sum, m) => sum + m.issuesProcessed, 0);
const totalCostSavings = monthlyTrend.reduce((sum, m) => sum + m.costSavings, 0);
const totalHours = monthlyTrend.reduce((sum, m) => sum + m.timeSavedHours, 0);
const latestMonth = monthlyTrend[monthlyTrend.length - 1];
const previousMonth = monthlyTrend[monthlyTrend.length - 2];

export const mockPublicMetrics: PublicMetrics = {
  totalIssuesProcessed: totalIssues,
  avgResponseTimeSeconds: 45,
  autoResolutionRate: 32.5,
  roi: latestMonth.roi,
  monthlyTrend,
};

export const mockExecutiveMetrics: ExecutiveMetrics = {
  roi: latestMonth.roi,
  roiDelta: ((latestMonth.roi - previousMonth.roi) / previousMonth.roi) * 100,
  timeSavedHours: latestMonth.timeSavedHours,
  timeSavedDelta: ((latestMonth.timeSavedHours - previousMonth.timeSavedHours) / previousMonth.timeSavedHours) * 100,
  costSavingsKRW: latestMonth.costSavings,
  costSavingsDelta: ((latestMonth.costSavings - previousMonth.costSavings) / previousMonth.costSavings) * 100,
  issuesProcessed: latestMonth.issuesProcessed,
  issuesProcessedDelta: ((latestMonth.issuesProcessed - previousMonth.issuesProcessed) / previousMonth.issuesProcessed) * 100,
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
  totalCostUSD: 48.50,
  totalCostDelta: 3.2,
  dailyTrend,
  decisionDistribution: {
    valid: Math.floor(latestMonth.issuesProcessed * 0.72),
    invalid: Math.floor(latestMonth.issuesProcessed * 0.14),
    duplicate: Math.floor(latestMonth.issuesProcessed * 0.10),
    needsInfo: Math.floor(latestMonth.issuesProcessed * 0.04),
  },
  processingTimes: {
    triageSeconds: 12,
    analyzeSeconds: 45,
    fixSeconds: 180,
  },
};
