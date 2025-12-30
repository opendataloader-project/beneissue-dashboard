"use client";

import { ChevronDown, ExternalLink, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";

import type { DeveloperRole } from "@/types/roi";
import { useTranslation } from "@/hooks/useTranslation";
import { DEVELOPER_RATES, DEVELOPER_ROLE_OPTIONS } from "@/data/developer-rates";
import { cn } from "@/lib/utils";

interface DeveloperRateSelectProps {
  value: DeveloperRole;
  onChange: (value: DeveloperRole) => void;
}

export function DeveloperRateSelect({
  value,
  onChange,
}: DeveloperRateSelectProps) {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRate = DEVELOPER_RATES[value];
  const displayLabel =
    language === "ko" ? currentRate.labelKo : currentRate.labelEn;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2",
          "bg-muted/50 border border-border rounded-lg",
          "text-sm font-medium text-foreground",
          "hover:bg-muted hover:border-primary/50",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-colors"
        )}
      >
        <User className="w-4 h-4 text-muted-foreground" />
        <span>{displayLabel}</span>
        <span className="text-muted-foreground">
          (${currentRate.hourlyRateUSD.toFixed(2)}/h)
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 min-w-[300px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {DEVELOPER_ROLE_OPTIONS.map((role) => {
              const rate = DEVELOPER_RATES[role];
              const label = language === "ko" ? rate.labelKo : rate.labelEn;
              const isSelected = role === value;

              return (
                <button
                  key={role}
                  onClick={() => {
                    onChange(role);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left",
                    "flex items-center justify-between",
                    "hover:bg-muted transition-colors",
                    isSelected && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isSelected ? "bg-primary" : "bg-transparent"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    ${rate.hourlyRateUSD.toFixed(2)}/h
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2 text-xs border-t border-border bg-muted/30">
            <a
              href="https://www.sw.or.kr/site/sw/ex/board/View.do?cbIdx=304&bcIdx=57938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              {t("developerRateSource")}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
