"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, GitBranch } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface RepoFilterProps {
  repos: string[];
  value: string | null;
  onChange: (repo: string | null) => void;
  isLoading?: boolean;
}

export function RepoFilter({
  repos,
  value,
  onChange,
  isLoading,
}: RepoFilterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const getDisplayName = (repo: string) => {
    // Show only repo name without owner if too long
    const parts = repo.split("/");
    return parts.length > 1 ? parts[1] : repo;
  };

  const selectedLabel = value ? getDisplayName(value) : t("allRepos");

  if (isLoading) {
    return <div className="h-9 w-32 bg-muted/50 rounded-lg animate-pulse" />;
  }

  if (repos.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium min-w-45",
          "bg-muted/50 border border-border rounded-lg",
          "hover:bg-muted transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        )}
      >
        <GitBranch className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 text-left truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] max-h-[300px] overflow-auto bg-background border border-border rounded-lg shadow-lg py-1">
          {/* All Repos option */}
          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
              "hover:bg-muted transition-colors",
              value === null && "bg-muted/50 font-medium"
            )}
          >
            <Check
              className={cn(
                "w-4 h-4",
                value === null ? "opacity-100" : "opacity-0"
              )}
            />
            <span>{t("allRepos")}</span>
          </button>

          <div className="h-px bg-border my-1" />

          {/* Repo list */}
          {repos.map((repo) => (
            <button
              key={repo}
              onClick={() => {
                onChange(repo);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
                "hover:bg-muted transition-colors",
                value === repo && "bg-muted/50 font-medium"
              )}
            >
              <Check
                className={cn(
                  "w-4 h-4",
                  value === repo ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate" title={repo}>
                {repo}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
