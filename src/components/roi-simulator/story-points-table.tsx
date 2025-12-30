"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { STORY_POINT_MAPPINGS, DEFAULT_STORY_POINTS } from "@/data/developer-rates";
import { cn } from "@/lib/utils";

export function StoryPointsTable() {
  const { t, language } = useTranslation();

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{t("storyPointsReference")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                {t("storyPoints")}
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                {t("timeEstimate")}
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                {t("avgHours")}
              </th>
            </tr>
          </thead>
          <tbody>
            {STORY_POINT_MAPPINGS.map((mapping) => {
              const isDefault = mapping.points === DEFAULT_STORY_POINTS;
              const description =
                language === "ko"
                  ? mapping.descriptionKo
                  : mapping.descriptionEn;

              return (
                <tr
                  key={mapping.points}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    isDefault && "bg-primary/5"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold tabular-nums",
                          isDefault
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {mapping.points}
                      </span>
                      {isDefault && (
                        <span className="text-xs font-medium text-primary">
                          {t("defaultValue")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{description}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-foreground">
                    {mapping.avgHours}h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {t("storyPointsNote")}
      </p>
    </div>
  );
}
