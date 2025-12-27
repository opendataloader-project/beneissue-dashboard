import type {
  PublicMetrics,
  ExecutiveMetrics,
  OperationsMetrics,
  MonthlyData,
  DailyData,
} from '@/types/metrics';

// Generate monthly trend data for the past 6 months
const generateMonthlyTrend = (): MonthlyData[] => {
  const months: MonthlyData[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Simulate growth trend
    const baseIssues = 800 + i * 150 + Math.floor(Math.random() * 200);
    const baseCost = baseIssues * 5000 + Math.floor(Math.random() * 500000);
    const baseHours = Math.round(baseIssues * 0.12);
    const baseRoi = 700 + i * 30 + Math.floor(Math.random() * 50);

    months.push({
      month,
      issuesProcessed: baseIssues,
      costSavings: baseCost,
      timeSavedHours: baseHours,
      roi: baseRoi,
    });
  }

  return months;
};

// Generate daily trend data for the past 14 days
const generateDailyTrend = (): DailyData[] => {
  const days: DailyData[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const triageCount = 30 + Math.floor(Math.random() * 20);
    const analyzeCount = Math.floor(triageCount * 0.7);
    const fixCount = Math.floor(analyzeCount * 0.4);
    const filteringRate = 20 + Math.floor(Math.random() * 15);

    days.push({
      date: dateStr,
      triageCount,
      analyzeCount,
      fixCount,
      filteringRate,
    });
  }

  return days;
};

const monthlyTrend = generateMonthlyTrend();
const dailyTrend = generateDailyTrend();

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
