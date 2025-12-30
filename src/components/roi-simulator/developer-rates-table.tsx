"use client";

import {
  DEVELOPER_RATES,
  DEVELOPER_ROLE_OPTIONS,
} from "@/data/developer-rates";
import { ExternalLink } from "lucide-react";

import type { DeveloperRole } from "@/types/roi";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface DeveloperRatesTableProps {
  selectedRole?: DeveloperRole;
}

export function DeveloperRatesTable({
  selectedRole,
}: DeveloperRatesTableProps) {
  const { t, language } = useTranslation();

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t("developerRatesReference")}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                {t("role")}
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                {t("hourlyRate")}
              </th>
            </tr>
          </thead>
          <tbody>
            {DEVELOPER_ROLE_OPTIONS.map((role) => {
              const rate = DEVELOPER_RATES[role];
              const isSelected = role === selectedRole;
              const label = language === "ko" ? rate.labelKo : rate.labelEn;

              return (
                <tr
                  key={role}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      <span
                        className={cn(isSelected && "font-medium text-primary")}
                      >
                        {label}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-foreground">
                    ${rate.hourlyRateUSD.toFixed(2)}/h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs">
        <a
          href="https://www.sw.or.kr/site/sw/ex/board/View.do?cbIdx=304&bcIdx=57938"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          {t("developerRateSource")}
          <ExternalLink className="w-3 h-3" />
        </a>
      </p>
    </div>
  );
}
