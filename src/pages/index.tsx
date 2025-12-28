import Head from 'next/head';
import { FileCheck, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/stats/stat-card';
import { TrendLineChart } from '@/components/charts/trend-line-chart';
import { EmptyState } from '@/components/empty-state';
import { usePublicMetrics } from '@/hooks/useMetrics';

export default function Home() {
  const { data: metrics } = usePublicMetrics();

  return (
    <>
      <Head>
        <title>Beneissue - AI Issue Automation</title>
        <meta
          name="description"
          content="AI-powered issue automation that saves time and money. Track real-time metrics and ROI."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 observatory-grid pointer-events-none" />
        <div className="fixed inset-0 pointer-events-none">
          <div className="gradient-orb gradient-orb-cyan w-[600px] h-[600px] -top-48 -right-48" />
          <div className="gradient-orb gradient-orb-amber w-[500px] h-[500px] top-1/2 -left-64" />
        </div>
        <div className="scan-line" />

        {/* Content */}
        <div className="relative z-10">
          <Header />

          <main className="pt-16">
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
                    Live Metrics
                  </div>
                </div>

                {/* Headline */}
                <h1
                  className="text-center text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  <span className="block text-foreground">
                    AI-Powered Issue
                  </span>
                  <span className="block bg-gradient-to-r from-[oklch(0.75_0.18_195)] via-[oklch(0.78_0.16_75)] to-[oklch(0.75_0.18_195)] bg-clip-text text-transparent">
                    Automation
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
                  GitHub 이슈를 자동으로 분류하고 분석하고 수정합니다.
                  <br className="hidden md:block" />
                  개발자 시간을 절약하고 ROI를 극대화하세요.
                </p>

                {/* Stats Grid */}
                {metrics ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
                      <StatCard
                        title="총 처리 이슈"
                        value={metrics.totalIssuesProcessed}
                        suffix="건"
                        icon={FileCheck}
                        description="누적 처리량"
                        accentColor="cyan"
                        animationDelay={100}
                      />
                      <StatCard
                        title="평균 응답 시간"
                        value={metrics.avgResponseTimeSeconds}
                        suffix="초"
                        icon={Clock}
                        description="첫 응답까지"
                        accentColor="emerald"
                        animationDelay={200}
                      />
                      <StatCard
                        title="자동 해결율"
                        value={metrics.autoResolutionRate}
                        suffix="%"
                        icon={Sparkles}
                        description="AI가 직접 수정"
                        accentColor="purple"
                        animationDelay={300}
                      />
                      <StatCard
                        title="ROI"
                        value={metrics.roi}
                        suffix="%"
                        icon={TrendingUp}
                        description="투자 대비 수익"
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
                      title: '자동 분류',
                      description:
                        '이슈가 등록되면 AI가 즉시 유효성을 판단하고 중복 여부를 확인합니다.',
                      stat: '5분',
                      statLabel: '절약 / 이슈',
                    },
                    {
                      title: '심층 분석',
                      description:
                        '코드베이스를 분석하여 우선순위, 스토리 포인트, 담당자를 자동 지정합니다.',
                      stat: '30분',
                      statLabel: '절약 / 이슈',
                    },
                    {
                      title: '자동 수정',
                      description:
                        '간단한 버그는 AI가 직접 수정하고 PR을 생성합니다.',
                      stat: '2시간',
                      statLabel: '절약 / 이슈',
                    },
                  ].map((feature, index) => (
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
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
