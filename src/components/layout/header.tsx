"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dataModeAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import {
  Activity,
  Database,
  FlaskConical,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const [dataMode, setDataMode] = useAtom(dataModeAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOnDashboard = pathname === "/dashboard";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "backdrop-blur-xl bg-background/70",
        "border-b border-border/50",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Beneissue
            </span>
          </Link>

          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              isOnDashboard
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex items-center gap-3">
          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-secondary/50 transition-all duration-200",
                isMenuOpen && "bg-secondary/50 text-foreground"
              )}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-56",
                  "bg-background/95 backdrop-blur-xl",
                  "border border-border/50 rounded-xl shadow-xl",
                  "py-2 px-1",
                  "animate-in fade-in slide-in-from-top-2 duration-200"
                )}
              >
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data Source
                </div>

                {/* Demo Mode */}
                <button
                  onClick={() => {
                    setDataMode("mock");
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    dataMode === "mock"
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  <FlaskConical
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      dataMode !== "mock" && "group-hover:scale-110"
                    )}
                  />
                  <div className="flex-1 text-left">
                    <div>Demo</div>
                    <div className="text-xs opacity-60">Fixed sample data</div>
                  </div>
                  {dataMode === "mock" && (
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>

                {/* Live Mode */}
                <button
                  onClick={() => {
                    setDataMode("live");
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    dataMode === "live"
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  <Database
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      dataMode !== "live" && "group-hover:scale-110"
                    )}
                  />
                  <div className="flex-1 text-left">
                    <div>Live</div>
                    <div className="text-xs opacity-60">Real database</div>
                  </div>
                  {dataMode === "live" && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
