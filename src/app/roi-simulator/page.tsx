"use client";

import { Suspense } from "react";

import { useRepos } from "@/hooks/useMetrics";
import { useROIMetrics } from "@/hooks/useROIMetrics";
import { useROISearchParams } from "@/hooks/useROISearchParams";
import { useTranslation } from "@/hooks/useTranslation";
import { EmptyState } from "@/components/empty-state";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PeriodFilterSelect } from "@/components/period-filter";
import { RepoFilter } from "@/components/repo-filter";
import { DeveloperRateSelect } from "@/components/roi-simulator/developer-rate-select";
import { DeveloperRatesTable } from "@/components/roi-simulator/developer-rates-table";
import { ROIBreakdownChart } from "@/components/roi-simulator/roi-breakdown-chart";
import { ROISummaryCards } from "@/components/roi-simulator/roi-summary-cards";
import { ROITrendChart } from "@/components/roi-simulator/roi-trend-chart";
import { StoryPointsTable } from "@/components/roi-simulator/story-points-table";

function ROISimulatorContent() {
  const {
    period,
    repo,
    customRange,
    developerRole,
    setPeriod,
    setRepo,
    setCustomRange,
    setDeveloperRole,
  } = useROISearchParams();

  const { data: metrics, isLoading } = useROIMetrics({
    period,
    customRange,
    repo,
    developerRole,
  });

  const { repos, isLoading: reposLoading } = useRepos();
  const { t } = useTranslation();

  return (
    <DashboardLayout
      title={t("roiSimulator")}
      description={t("roiSimulatorDesc")}
    >
      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <DeveloperRateSelect
          value={developerRole}
          onChange={setDeveloperRole}
        />
        <div className="flex items-center gap-3">
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
      </div>

      {!isLoading && !metrics ? (
        <EmptyState />
      ) : (
        <>
          {/* ROI Summary Cards */}
          <div className="mb-8">
            <ROISummaryCards data={metrics} isLoading={isLoading} />
          </div>

          {/* Charts - 2 columns on large screens */}
          {metrics && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <ROIBreakdownChart data={metrics.savingsBreakdown} />
              <ROITrendChart data={metrics.monthlyTrend} />
            </div>
          )}

          {/* Reference Tables - 2 columns on large screens */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <StoryPointsTable />
            <DeveloperRatesTable selectedRole={developerRole} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default function ROISimulator() {
  return (
    <Suspense fallback={<ROISimulatorSkeleton />}>
      <ROISimulatorContent />
    </Suspense>
  );
}

function ROISimulatorSkeleton() {
  return (
    <DashboardLayout title="" description="">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="h-10 w-64 bg-muted/50 rounded-lg animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-9 w-64 bg-muted/50 rounded-lg animate-pulse" />
        </div>
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
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    </DashboardLayout>
  );
}
