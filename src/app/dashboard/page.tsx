"use client";

import { Suspense } from "react";
import { Clock, DollarSign, FileCheck, Sparkles } from "lucide-react";

import { useDashboardSearchParams } from "@/hooks/useDashboardSearchParams";
import { useDashboardMetrics, useRepos } from "@/hooks/useMetrics";
import { useTranslation } from "@/hooks/useTranslation";
import { CostTrendChart } from "@/components/charts/cost-trend-chart";
import { ResolutionDistributionChart } from "@/components/charts/resolution-distribution";
import { TrendChart } from "@/components/charts/trend-chart";
import { EmptyState } from "@/components/empty-state";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PeriodFilterSelect } from "@/components/period-filter";
import { RepoFilter } from "@/components/repo-filter";
import { KPICard } from "@/components/stats/kpi-card";

function DashboardContent() {
  const { period, repo, customRange, setPeriod, setRepo, setCustomRange } =
    useDashboardSearchParams();
  const { data: metrics, isLoading } = useDashboardMetrics({
    period,
    customRange,
    repo,
  });
  const { repos, isLoading: reposLoading } = useRepos();
  const { t } = useTranslation();

  return (
    <DashboardLayout
      title={t("dashboardTitle")}
      description={t("dashboardDesc")}
    >
      {/* Filters */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <RepoFilter
          repos={repos}
          value={repo}
          onChange={setRepo}
          isLoading={reposLoading}
        />
        <PeriodFilterSelect
          value={period}
          onChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {!isLoading && !metrics ? (
        <EmptyState />
      ) : (
        <>
          {/* KPI Cards - Spec: Total Processed, Auto Resolution Rate, Avg Response Time, Total AI Cost (per issue) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <KPICard
              title={t("totalProcessed")}
              value={metrics?.totalIssuesProcessed ?? 0}
              suffix={t("issuesUnit")}
              delta={metrics?.totalIssuesDelta}
              icon={FileCheck}
              accentColor="purple"
              animationDelay={100}
              isLoading={isLoading}
            />
            <KPICard
              title={t("autoResolutionRate")}
              value={metrics?.autoResolutionRate ?? 0}
              suffix="%"
              delta={metrics?.autoResolutionDelta}
              icon={Sparkles}
              accentColor="emerald"
              animationDelay={200}
              isLoading={isLoading}
            />
            <KPICard
              title={t("avgResponseTime")}
              value={metrics?.avgResponseTimeSeconds ?? 0}
              suffix={t("secondsUnit")}
              delta={metrics?.avgResponseTimeDelta}
              icon={Clock}
              accentColor="cyan"
              animationDelay={300}
              invertDelta
              isLoading={isLoading}
            />
            <KPICard
              title={t("totalAICost")}
              value={metrics ? `$${metrics.totalCostUSD.toFixed(2)}` : "$0.00"}
              delta={metrics?.totalCostDelta}
              icon={DollarSign}
              accentColor="amber"
              animationDelay={400}
              subtitle={
                metrics
                  ? `${t("perIssue")} $${metrics.costPerIssueUSD.toFixed(2)}`
                  : undefined
              }
              isLoading={isLoading}
            />
          </div>

          {/* Charts - Spec: Processing Trend + Cost Trend (2 columns) */}
          {metrics && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Processing Trend Chart (Stacked Bar + Line) */}
              <TrendChart
                data={metrics.trendData}
                title={t("trendChartTitle")}
                description={t("trendChartDesc")}
              />
              {/* Cost Trend Chart (Stacked Bar) */}
              <CostTrendChart
                data={metrics.costTrendData}
                title={t("costTrendChartTitle")}
                description={t("costTrendChartDesc")}
              />
            </div>
          )}

          {/* Resolution Distribution */}
          {metrics && (
            <div className="mb-8">
              <ResolutionDistributionChart
                data={metrics.resolutionDistribution}
              />
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <DashboardLayout title="" description="">
      <div className="flex justify-end items-center gap-3 mb-6">
        <div className="h-9 w-32 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-9 w-64 bg-muted/50 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="h-80 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-80 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    </DashboardLayout>
  );
}
