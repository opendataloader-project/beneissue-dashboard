"use client";

import { Database } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t("noDataAvailable");
  const displayDescription = description ?? t("noDataDesc");
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="p-4 rounded-full bg-muted/50 border border-border/50 mb-6">
        <Database className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2
        className="text-xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {displayTitle}
      </h2>
      <p className="text-muted-foreground text-center max-w-md">
        {displayDescription}
      </p>
    </div>
  );
}
