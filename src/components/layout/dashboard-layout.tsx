import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, LayoutDashboard, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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

          {/* Back to home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Public View</span>
          </Link>
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
