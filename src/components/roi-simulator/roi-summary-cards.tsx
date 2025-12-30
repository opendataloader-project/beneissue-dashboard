"use client";

import { Calculator, DollarSign, PiggyBank, TrendingUp } from "lucide-react";

import type { ROIMetrics } from "@/types/roi";
import { useTranslation } from "@/hooks/useTranslation";
import { KPICard } from "@/components/stats/kpi-card";

interface ROISummaryCardsProps {
  data: ROIMetrics | null;
  isLoading?: boolean;
}

function formatUSD(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(2);
}

function formatROI(value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(0)}K`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function ROISummaryCards({ data, isLoading = false }: ROISummaryCardsProps) {
  const { t, language } = useTranslation();

  const totalSavingsValue = data ? `$${formatUSD(data.totalHumanCostSaved)}` : "$0.00";
  const aiCostValue = data ? `$${formatUSD(data.totalAICost)}` : "$0.00";
  const netSavingsValue = data ? `$${formatUSD(data.netSavings)}` : "$0.00";
  const roiValue = data ? formatROI(data.roiPercentage) : "0";

  const issuesSubtitle = data
    ? `${data.totalAutoResolvedIssues}${language === "ko" ? "건 자동 해결" : " issues auto-resolved"}`
    : "";

  const perIssueSubtitle = data
    ? `${t("perIssue")} $${data.avgAICostPerIssue.toFixed(2)}`
    : "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title={t("totalCostSavings")}
        value={totalSavingsValue}
        subtitle={issuesSubtitle}
        icon={PiggyBank}
        accentColor="purple"
        animationDelay={0}
        isLoading={isLoading}
      />

      <KPICard
        title={t("aiCost")}
        value={aiCostValue}
        subtitle={perIssueSubtitle}
        icon={DollarSign}
        accentColor="amber"
        animationDelay={100}
        isLoading={isLoading}
      />

      <KPICard
        title={t("netSavings")}
        value={netSavingsValue}
        delta={data?.savingsDelta}
        icon={TrendingUp}
        accentColor="emerald"
        animationDelay={200}
        isLoading={isLoading}
      />

      <KPICard
        title={t("roi")}
        value={roiValue}
        suffix="%"
        delta={data?.roiDelta}
        subtitle={t("returnOnInvestment")}
        icon={Calculator}
        accentColor="cyan"
        animationDelay={300}
        isLoading={isLoading}
      />
    </div>
  );
}
