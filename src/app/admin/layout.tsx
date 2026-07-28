import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ProfileMenu } from '@/components/ProfileMenu';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, roles(name)")
    .eq("id", user.id)
    .single();

  // Ideally we would verify this user has the Admin role here.

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Top Header */}
        <header className="bg-white dark:bg-slate-950 h-16 border-b flex items-center justify-between px-6 shadow-sm shrink-0">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="text-emerald-600">MANTIS</span> Admin
            </h1>
            
            {/* Spacer for desktop */}
            <div className="hidden md:block flex-1"></div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-4">
              <ProfileMenu profile={profile} />
            </div>
        </header>
        <div className="p-6 lg:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
