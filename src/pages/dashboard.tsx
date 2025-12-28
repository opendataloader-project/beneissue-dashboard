import Head from 'next/head';
import { FileCheck, Sparkles, Clock, DollarSign, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { KPICard } from '@/components/stats/kpi-card';
import { DailyTrendChart } from '@/components/charts/daily-trend-chart';
import { DecisionDistributionChart } from '@/components/charts/decision-distribution';
import { PeriodFilterSelect } from '@/components/period-filter';
import { EmptyState } from '@/components/empty-state';
import { useDashboardMetrics } from '@/hooks/useMetrics';
import { formatSeconds } from '@/lib/format';

export default function Dashboard() {
  const { data: metrics, period, setPeriod } = useDashboardMetrics();

  return (
    <>
      <Head>
        <title>Dashboard - Beneissue</title>
        <meta
          name="description"
          content="AI issue automation dashboard showing processing metrics and costs."
        />
      </Head>

      <DashboardLayout
        title="Dashboard"
        description="AI 이슈 자동화 성능 현황 (팩트 기반)"
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
                title="총 처리량"
                value={metrics.totalIssuesProcessed}
                suffix="건"
                delta={metrics.totalIssuesDelta}
                icon={FileCheck}
                accentColor="purple"
                animationDelay={100}
              />
              <KPICard
                title="자동 해결율"
                value={metrics.autoResolutionRate}
                suffix="%"
                delta={metrics.autoResolutionDelta}
                icon={Sparkles}
                accentColor="emerald"
                animationDelay={200}
              />
              <KPICard
                title="평균 응답 시간"
                value={metrics.avgResponseTimeSeconds}
                suffix="초"
                delta={metrics.avgResponseTimeDelta}
                icon={Clock}
                accentColor="cyan"
                animationDelay={300}
                invertDelta
              />
              <KPICard
                title="총 AI 비용"
                value={`$${metrics.totalCostUSD.toFixed(2)}`}
                delta={metrics.totalCostDelta}
                icon={DollarSign}
                accentColor="amber"
                animationDelay={400}
                subtitle={`건당 $${metrics.costPerIssueUSD.toFixed(2)}`}
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
                  처리 단계별 평균 시간
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  각 워크플로우 단계의 평균 처리 시간
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Triage', value: metrics.processingTimes.triageSeconds, color: 'oklch(0.75 0.18 195)', description: '이슈 유효성 검증' },
                  { label: 'Analyze', value: metrics.processingTimes.analyzeSeconds, color: 'oklch(0.78 0.16 75)', description: '코드 분석 및 우선순위 결정' },
                  { label: 'Fix', value: metrics.processingTimes.fixSeconds, color: 'oklch(0.70 0.20 145)', description: 'PR 생성 및 코드 수정' },
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
                      {formatSeconds(item.value)}
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
    </>
  );
}
