import { Header } from './header';
import { Footer } from './footer';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 observatory-grid pointer-events-none opacity-50" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-cyan w-[600px] h-[600px] -top-48 -right-48 opacity-30" />
        <div className="gradient-orb gradient-orb-amber w-[500px] h-[500px] top-1/2 -left-64 opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
