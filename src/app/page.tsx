"use client";

import { Clock, DollarSign, FileCheck, Sparkles } from "lucide-react";

import { usePublicMetrics } from "@/hooks/useMetrics";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stats/stat-card";

export default function Home() {
  const { data: metrics } = usePublicMetrics();
  const { t } = useTranslation();

  return (
    <>
      {/* Scan line effect for home page */}
      <div className="scan-line" />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {t("liveMetrics")}
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-center text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            <span className="block text-foreground">{t("heroTitle1")}</span>
            <span className="block bg-gradient-to-r from-[oklch(0.75_0.18_195)] via-[oklch(0.78_0.16_75)] to-[oklch(0.75_0.18_195)] bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
            {t("heroSubtitle")}
          </p>

          {/* Stats Grid */}
          {metrics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
                <StatCard
                  title={t("totalProcessed")}
                  value={metrics.totalIssuesProcessed}
                  suffix={t("issuesUnit")}
                  icon={FileCheck}
                  description={t("cumulativeProcessed")}
                  accentColor="purple"
                  animationDelay={100}
                />
                <StatCard
                  title={t("autoResolutionRate")}
                  value={metrics.autoResolutionRate}
                  suffix="%"
                  icon={Sparkles}
                  description={t("aiDirectFix")}
                  accentColor="emerald"
                  animationDelay={200}
                />
                <StatCard
                  title={t("avgResponseTime")}
                  value={metrics.avgResponseTimeSeconds}
                  suffix={t("secondsUnit")}
                  icon={Clock}
                  description={t("toFirstResponse")}
                  accentColor="cyan"
                  animationDelay={300}
                />
                <StatCard
                  title={t("totalAICost")}
                  value={`$${metrics.totalCostUSD.toFixed(2)}`}
                  icon={DollarSign}
                  description={t("totalAPICost")}
                  accentColor="amber"
                  animationDelay={400}
                />
              </div>

              {/* Chart */}
              <TrendLineChart data={metrics.monthlyTrend} />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      {/* Features/Value Props */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: t("autoClassification"),
                description: t("autoClassificationDesc"),
                stat: "5min",
                statLabel: t("savedPerIssue"),
              },
              {
                title: t("deepAnalysis"),
                description: t("deepAnalysisDesc"),
                stat: "30min",
                statLabel: t("savedPerIssue"),
              },
              {
                title: t("autoFix"),
                description: t("autoFixDesc"),
                stat: "2hr",
                statLabel: t("savedPerIssue"),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <div className="text-right">
                    <span
                      className="text-2xl font-bold text-primary tabular-nums"
                      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                      {feature.stat}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {feature.statLabel}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
