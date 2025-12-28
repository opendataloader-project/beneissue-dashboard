"use client";

import { Clock, DollarSign, FileCheck, Sparkles, Zap } from "lucide-react";

import { useDashboardMetrics } from "@/hooks/useMetrics";
import { useTranslation } from "@/hooks/useTranslation";
import { DailyTrendChart } from "@/components/charts/daily-trend-chart";
import { DecisionDistributionChart } from "@/components/charts/decision-distribution";
import { EmptyState } from "@/components/empty-state";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PeriodFilterSelect } from "@/components/period-filter";
import { KPICard } from "@/components/stats/kpi-card";

export default function Dashboard() {
  const { data: metrics, period, setPeriod } = useDashboardMetrics();
  const { t } = useTranslation();

  // Format seconds with i18n
  const formatSecondsI18n = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}${t("seconds")}`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}${t("minutes")}`;
    return `${(seconds / 3600).toFixed(1)}${t("hours")}`;
  };

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

          {/* KPI Cards */}
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

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <DailyTrendChart data={metrics.dailyTrend} />
            <DecisionDistributionChart data={metrics.decisionDistribution} />
          </div>

          {/* Processing Times */}
          <div className="relative rounded-xl border bg-card/50 backdrop-blur-sm p-6">
            <div className="mb-6">
              <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              >
                <Zap className="w-5 h-5 text-primary" />
                {t("processingTimeByStep")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("processingTimeByStepDesc")}
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  label: "Triage",
                  value: metrics.processingTimes.triageSeconds,
                  color: "oklch(0.75 0.18 195)",
                  description: t("triageDesc"),
                },
                {
                  label: "Analyze",
                  value: metrics.processingTimes.analyzeSeconds,
                  color: "oklch(0.78 0.16 75)",
                  description: t("analyzeDesc"),
                },
                {
                  label: "Fix",
                  value: metrics.processingTimes.fixSeconds,
                  color: "oklch(0.70 0.20 145)",
                  description: t("fixDesc"),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative p-4 rounded-lg border bg-background/50"
                >
                  <div
                    className="absolute top-0 left-4 right-4 h-px opacity-30"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                    }}
                  />
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p
                    className="text-3xl font-bold tabular-nums"
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      color: item.color,
                    }}
                  >
                    {formatSecondsI18n(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </DashboardLayout>
  );
}
