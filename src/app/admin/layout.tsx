import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AdminSidebarNav } from '@/components/AdminSidebarNav';
import Image from 'next/image';

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
        <header className="bg-white dark:bg-slate-950 h-16 border-b flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger render={
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                      <Menu className="h-6 w-6" />
                    </Button>
                  } />
                  <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0 bg-slate-900 border-r-slate-800">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="p-4 border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-2">
                          <Image src="/logo.png" alt="Mantis Logo" width={120} height={40} className="h-8 w-auto object-contain brightness-0 invert" />
                          <span className="text-xl font-bold text-slate-300">Admin</span>
                        </div>
                      </div>
                      <AdminSidebarNav />
                      <div className="p-4 border-t border-slate-800 shrink-0">
                        <form action="/auth/signout" method="post">
                          <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800" type="submit">
                            <LogOut size={20} className="mr-3" /> Sign Out
                          </Button>
                        </form>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Mantis Logo" width={120} height={40} className="h-8 w-auto object-contain" />
                <span className="text-lg font-bold text-slate-500 hidden sm:inline-block">Admin</span>
              </div>
            </div>
            
            {/* Spacer for desktop */}
            <div className="hidden md:block flex-1"></div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-4">
              <ProfileMenu profile={profile} />
            </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
