import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogOut, QrCode, History, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ideally we would fetch the user's role from the `profiles` table.
  // For MVP, we'll assume this is the personnel dashboard.

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Mobile-first Header */}
      <header className="bg-white dark:bg-slate-900 border-b p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm h-16">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Mantis Logo" width={100} height={32} className="h-8 w-auto object-contain" />
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="icon" type="submit" title="Sign Out">
            <LogOut className="h-5 w-5 text-slate-500" />
          </Button>
        </form>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="bg-white dark:bg-slate-900 border-t fixed bottom-0 w-full flex justify-around items-center p-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:pb-3">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-500 hover:text-emerald-600 transition-colors">
          <QrCode className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Scan</span>
        </Link>
        <Link href="/dashboard/history" className="flex flex-col items-center text-slate-500 hover:text-emerald-600 transition-colors">
          <History className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">History</span>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center text-slate-500 hover:text-emerald-600 transition-colors">
          <User className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
