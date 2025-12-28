import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, LayoutDashboard, Settings, ArrowLeft, Menu, X, Database, FlaskConical } from 'lucide-react';
import { useAtom } from 'jotai';
import { cn } from '@/lib/utils';
import { dataModeAtom } from '@/store/atoms';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Executive', icon: LayoutDashboard },
  { href: '/ops', label: 'Operations', icon: Settings },
];

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [dataMode, setDataMode] = useAtom(dataModeAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 observatory-grid pointer-events-none opacity-50" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-cyan w-[400px] h-[400px] -top-32 -right-32 opacity-30" />
        <div className="gradient-orb gradient-orb-amber w-[300px] h-[300px] bottom-0 -left-32 opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              >
                Beneissue
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: Back + Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public View</span>
            </Link>

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-secondary/50 transition-all duration-200',
                  isMenuOpen && 'bg-secondary/50 text-foreground'
                )}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className={cn(
                    'absolute right-0 top-full mt-2 w-56',
                    'bg-background/95 backdrop-blur-xl',
                    'border border-border/50 rounded-xl shadow-xl',
                    'py-2 px-1',
                    'animate-in fade-in slide-in-from-top-2 duration-200'
                  )}
                >
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data Source
                  </div>

                  {/* Demo Mode */}
                  <button
                    onClick={() => {
                      setDataMode('mock');
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'text-sm font-medium transition-all duration-200',
                      dataMode === 'mock'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                    )}
                  >
                    <FlaskConical className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      dataMode !== 'mock' && 'group-hover:scale-110'
                    )} />
                    <div className="flex-1 text-left">
                      <div>Demo</div>
                      <div className="text-xs opacity-60">Fixed sample data</div>
                    </div>
                    {dataMode === 'mock' && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </button>

                  {/* Live Mode */}
                  <button
                    onClick={() => {
                      setDataMode('live');
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'text-sm font-medium transition-all duration-200',
                      dataMode === 'live'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                    )}
                  >
                    <Database className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      dataMode !== 'live' && 'group-hover:scale-110'
                    )} />
                    <div className="flex-1 text-left">
                      <div>Live</div>
                      <div className="text-xs opacity-60">Real database</div>
                    </div>
                    {dataMode === 'live' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
