import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, BellRing, KeyRound, LogOut, CheckCircle, ClipboardCheck } from 'lucide-react';
import { PushSubscriptionButton } from '@/components/PushSubscriptionButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Profile Info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single();

  // Fetch Quick Stats
  const { count: inspectionsCount } = await supabase
    .from('inspection_reports')
    .select('*', { count: 'exact', head: true })
    .eq('inspected_by', user.id);

  const { count: tasksCount } = await supabase
    .from('corrective_actions')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_user_id', user.id)
    .in('status', ['Closed', 'Resolved']);

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Profile Section */}
      <section className="flex flex-col items-center pt-8 pb-4 text-center">
        <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-sm border-4 border-white ring-1 ring-slate-100">
          {initial}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{userName}</h2>
        <p className="text-slate-500 font-medium">{profile?.role || "Personnel"}</p>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-4 px-2">
        <Card className="shadow-sm border-slate-200 bg-emerald-50/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <ClipboardCheck className="h-6 w-6 text-emerald-600 mb-2" />
            <h4 className="text-2xl font-bold text-emerald-950">{inspectionsCount || 0}</h4>
            <span className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Inspections</span>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-blue-50/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="text-2xl font-bold text-blue-950">{tasksCount || 0}</h4>
            <span className="text-xs text-blue-700 font-medium uppercase tracking-wider">Tasks Done</span>
          </CardContent>
        </Card>
      </section>

      {/* Details List */}
      <section className="px-2">
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 mb-0.5">Full Name</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 mb-0.5">Email Address</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{profile?.email || user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 mb-0.5">Access Level</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{profile?.role || "Personnel"}</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Settings & Actions */}
      <section className="px-2 space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">Settings</h3>
        
        <Card className="shadow-sm border-slate-200">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Push Notifications</p>
                <p className="text-xs text-slate-500">Get alerted for new tasks</p>
              </div>
            </div>
            <PushSubscriptionButton />
          </div>
        </Card>

        <Link href="/auth/change-password" className="block">
          <Card className="shadow-sm border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Change Password</p>
                <p className="text-xs text-slate-500">Update your login credentials</p>
              </div>
            </div>
          </Card>
        </Link>
      </section>

      {/* Log Out */}
      <section className="px-2 pt-4">
        <form action="/auth/signout" method="post">
          <Button variant="outline" className="w-full h-14 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 font-semibold rounded-xl" type="submit">
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </form>
      </section>

    </div>
  );
}
