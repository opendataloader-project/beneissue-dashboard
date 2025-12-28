import Head from 'next/head';
import { TrendingUp, Clock, Wallet, FileCheck, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { KPICard } from '@/components/stats/kpi-card';
import { CostSavingsChart } from '@/components/charts/cost-savings-chart';
import { DistributionPie } from '@/components/charts/distribution-pie';
import { EmptyState } from '@/components/empty-state';
import { useExecutiveMetrics } from '@/hooks/useMetrics';

export default function Dashboard() {
  const { data: metrics } = useExecutiveMetrics();

  return (
    <>
      <Head>
        <title>Executive Dashboard - Beneissue</title>
        <meta
          name="description"
          content="Executive dashboard showing ROI, cost savings, and business metrics for AI issue automation."
        />
      </Head>

      <DashboardLayout
        title="Executive Dashboard"
        description="경영진을 위한 ROI 및 비용 절감 현황"
      >
        {metrics ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <KPICard
                title="ROI"
                value={metrics.roi}
                suffix="%"
                delta={metrics.roiDelta}
                icon={TrendingUp}
                accentColor="amber"
                animationDelay={100}
              />
              <KPICard
                title="시간 절감"
                value={metrics.timeSavedHours}
                suffix="시간"
                delta={metrics.timeSavedDelta}
                icon={Clock}
                accentColor="cyan"
                animationDelay={200}
              />
              <KPICard
                title="비용 절감"
                value={Math.round(metrics.costSavingsKRW / 10000)}
                suffix="만원"
                delta={metrics.costSavingsDelta}
                icon={Wallet}
                accentColor="emerald"
                animationDelay={300}
              />
              <KPICard
                title="처리 건수"
                value={metrics.issuesProcessed}
                suffix="건"
                delta={metrics.issuesProcessedDelta}
                icon={FileCheck}
                accentColor="purple"
                animationDelay={400}
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <CostSavingsChart data={metrics.monthlyTrend} />
              <DistributionPie data={metrics.processingDistribution} />
            </div>

            {/* Summary sentence */}
            <div className="relative rounded-xl border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    이번 달 요약
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {metrics.summaryText}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    AI 자동화로 개발팀의 생산성이 크게 향상되었습니다.
                    비용 대비 효과가 지속적으로 증가하고 있으며,
                    더 많은 이슈를 자동으로 처리할 수 있게 되었습니다.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </DashboardLayout>
    </>
  );
}
