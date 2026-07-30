import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Clock, CheckCircle, AlertTriangle, Activity, ClipboardList, MapPin } from 'lucide-react';
import { PushSubscriptionButton } from '@/components/PushSubscriptionButton';
import { getUserPermissions } from '@/lib/permissions';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const greetingName = profile?.full_name || user.email?.split('@')[0] || 'User';

  // 2. Fetch Recent Activity
  const { data: recentActivity, error: recentError } = await supabase
    .from('inspection_reports')
    .select('id, reference_number, created_at, verification_status, checkpoints(checkpoint_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (recentError) {
    console.error("Error fetching recent activity:", recentError);
  }

  // 3. Fetch Today's Assignments
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: schedules } = await supabase
    .from("inspection_schedules")
    .select("*, checkpoints(id, checkpoint_name, property_id)")
    .eq("is_active", true)
    .order("start_time", { ascending: true });

  const { data: todaysReports } = await supabase
    .from('inspection_reports')
    .select('checkpoint_id')
    .gte('created_at', todayStart.toISOString())
    .lte('created_at', todayEnd.toISOString());
    
  const completedCheckpointIds = new Set(todaysReports?.map(r => r.checkpoint_id) || []);

  const tasks = schedules?.map(s => {
    const isCompleted = completedCheckpointIds.has(s.checkpoints?.id);
    return {
      id: s.id,
      name: s.checkpoints?.checkpoint_name || "Unknown Checkpoint",
      time: `${s.start_time?.slice(0,5) || '00:00'} - ${s.due_time?.slice(0,5) || '23:59'}`,
      status: isCompleted ? 'Completed' : 'Pending'
    };
  }) || [];

  // 4. Fetch Tasks
  const { data: myTasks } = await supabase
    .from('corrective_actions')
    .select('id, finding_description, due_date, status, severity')
    .eq('assigned_user_id', user.id)
    .neq('status', 'Closed')
    .order('due_date', { ascending: true })
    .limit(5);

  // 5. Check Admin Permissions
  const userPerms = await getUserPermissions(supabase, user.id);
  const hasAdminAccess = userPerms.is_super_admin || userPerms.permissions.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Welcome Section */}
      <section className="flex justify-between items-center bg-emerald-700 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 p-6 sm:p-8 rounded-b-3xl text-white shadow-md">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Hello, {greetingName}
          </h2>
          <p className="text-emerald-100 text-sm font-medium">
            {profile?.role || "Personnel"} • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-white/20 rounded-full p-2">
          <PushSubscriptionButton />
        </div>
      </section>

      {/* Big Action Button */}
      <section className="px-4 flex flex-col gap-3">
        <Link href="/dashboard/scan">
          <Button className="w-full h-20 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 transition-transform active:scale-95">
            <QrCode className="h-8 w-8" />
            Scan Checkpoint
          </Button>
        </Link>
        {hasAdminAccess ? (
          <Link href="/admin">
            <Button variant="outline" className="w-full h-14 text-slate-700 border-slate-300 rounded-xl flex items-center justify-center gap-2 bg-white">
              <Settings className="h-5 w-5 text-slate-500" />
              Go to Admin Panel
            </Button>
          </Link>
        ) : (
          <Button variant="outline" disabled className="w-full h-14 text-slate-400 border-slate-200 rounded-xl flex items-center justify-center gap-2 bg-slate-50 opacity-60">
            <Settings className="h-5 w-5 text-slate-300" />
            Admin Panel (No Access)
          </Button>
        )}
      </section>

      {/* Task List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600" /> My Tasks
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full font-medium">
            {myTasks?.length || 0} Open
          </span>
        </div>
        <div className="space-y-3">
          {!myTasks || myTasks.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">You have no pending tasks! 🎉</p>
            </div>
          ) : (
            myTasks.map((task) => (
              <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="block">
                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-emerald-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{task.finding_description}</h4>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                          <span className="font-semibold text-emerald-600">{task.status}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                          task.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          task.severity === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {task.severity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Assignment List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" /> Today's Inspections
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full font-medium">
            {tasks.filter(t => t.status === 'Completed').length} / {tasks.length} Done
          </span>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 && (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No inspections assigned for today.</p>
            </div>
          )}
          {tasks.map((task) => (
            <Card key={task.id} className={`border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors ${task.status === 'Completed' ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
              <div className={`h-1 w-full ${task.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold text-sm ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {task.time}
                  </p>
                </div>
                <div>
                  {task.status === 'Completed' ? (
                    <CheckCircle className="text-emerald-500 h-6 w-6" />
                  ) : (
                    <AlertTriangle className="text-amber-500 h-6 w-6" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center mb-4 gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Scans</h3>
        </div>
        
        <div className="space-y-3">
          {!recentActivity || recentActivity.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">You haven't completed any scans yet.</p>
            </div>
          ) : (
            recentActivity.map((report: any) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{report.checkpoints?.checkpoint_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <div className="shrink-0 ml-2">
                  <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                    report.verification_status === 'Verified' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    report.verification_status === 'Flagged' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {report.verification_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
