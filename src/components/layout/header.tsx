import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'backdrop-blur-xl bg-background/70',
        'border-b border-border/50',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
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

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(
              'group flex items-center gap-2 px-4 py-2 rounded-lg',
              'text-sm font-medium text-muted-foreground',
              'hover:text-foreground hover:bg-secondary/50',
              'transition-all duration-200'
            )}
          >
            Dashboard
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
