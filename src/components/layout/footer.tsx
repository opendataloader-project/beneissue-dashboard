import { Activity, ExternalLink, Github } from "lucide-react";

import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border/50 bg-card/30 backdrop-blur-sm",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              >
                Beneissue
              </p>
              <p className="text-xs text-muted-foreground">
                AI-Powered Issue Automation
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/opendataloader/beneissue"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {new Date().getFullYear()} OpenDataLoader. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
