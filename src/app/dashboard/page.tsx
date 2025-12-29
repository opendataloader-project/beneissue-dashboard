"use client";

import { Clock, DollarSign, FileCheck, Sparkles } from "lucide-react";

import { useDashboardMetrics } from "@/hooks/useMetrics";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendChart } from "@/components/charts/trend-chart";
import { ResolutionDistributionChart } from "@/components/charts/resolution-distribution";
import { EmptyState } from "@/components/empty-state";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PeriodFilterSelect } from "@/components/period-filter";
import { KPICard } from "@/components/stats/kpi-card";

export default function Dashboard() {
  const { data: metrics, period, setPeriod } = useDashboardMetrics();
  const { t } = useTranslation();

  return (
    <DashboardLayout
      title={t("dashboardTitle")}
      description={t("dashboardDesc")}
    >
      {metrics ? (
        <>
          {/* Period Filter */}
          <div className="flex justify-end mb-6">
            <PeriodFilterSelect value={period} onChange={setPeriod} />
          </div>

          {/* KPI Cards - 기획서: 총 처리량, 자동해결율, 평균응답시간, 총 AI비용(건당 포함) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <KPICard
              title={t("totalProcessed")}
              value={metrics.totalIssuesProcessed}
              suffix={t("issuesUnit")}
              delta={metrics.totalIssuesDelta}
              icon={FileCheck}
              accentColor="purple"
              animationDelay={100}
            />
            <KPICard
              title={t("autoResolutionRate")}
              value={metrics.autoResolutionRate}
              suffix="%"
              delta={metrics.autoResolutionDelta}
              icon={Sparkles}
              accentColor="emerald"
              animationDelay={200}
            />
            <KPICard
              title={t("avgResponseTime")}
              value={metrics.avgResponseTimeSeconds}
              suffix={t("secondsUnit")}
              delta={metrics.avgResponseTimeDelta}
              icon={Clock}
              accentColor="cyan"
              animationDelay={300}
              invertDelta
            />
            <KPICard
              title={t("totalAICost")}
              value={`$${metrics.totalCostUSD.toFixed(2)}`}
              delta={metrics.totalCostDelta}
              icon={DollarSign}
              accentColor="amber"
              animationDelay={400}
              subtitle={`${t("perIssue")} $${metrics.costPerIssueUSD.toFixed(2)}`}
            />
          </div>

          {/* Charts - 기획서: 추이 차트 + 결과 분포 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* 추이 차트 (Stacked Bar + Line) */}
            <TrendChart
              data={metrics.trendData}
              title={t("trendChartTitle")}
              description={t("trendChartDesc")}
            />
            {/* 결과 분포 (2분류 바) */}
            <ResolutionDistributionChart data={metrics.resolutionDistribution} />
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </DashboardLayout>
  );
}
