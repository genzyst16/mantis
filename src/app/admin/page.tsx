import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, CheckCircle, Clock, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get start of today (local timezone adjustment via basic JS, or roughly UTC)
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayISO = today.toISOString();

  // 1. Total Inspections Today
  const { count: totalInspectionsToday } = await supabase
    .from("inspection_reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISO);

  // 2. Verified (Not Flagged)
  const { count: totalVerified } = await supabase
    .from("inspection_reports")
    .select("*", { count: "exact", head: true })
    .neq("verification_status", "Flagged");

  // 3. Flagged / Exceptions
  const { count: totalFlagged } = await supabase
    .from("inspection_reports")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "Flagged");

  // 4. Pending Tasks
  const { count: pendingTasks } = await supabase
    .from("corrective_actions")
    .select("*", { count: "exact", head: true })
    .neq("status", "Closed");

  // 5. Recent Activity from audit_logs
  const { data: recentActivity } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      entity_type,
      created_at,
      profiles ( full_name, email )
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  const formatActivityText = (log: any) => {
    const user = log.profiles?.full_name || log.profiles?.email || 'System';
    const actionMap: Record<string, string> = {
      'INSERT': 'created a new',
      'UPDATE': 'updated a',
      'DELETE': 'deleted a'
    };
    const actionText = actionMap[log.action] || log.action;
    const entity = log.entity_type.replace('_', ' ').replace(/s$/, '');
    return `${user} ${actionText} ${entity}`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <PlusCircle size={18} className="text-emerald-600 dark:text-emerald-400" />;
      case 'UPDATE': return <Edit3 size={18} className="text-blue-600 dark:text-blue-400" />;
      case 'DELETE': return <Trash2 size={18} className="text-red-600 dark:text-red-400" />;
      default: return <Activity size={18} className="text-slate-600" />;
    }
  };
  
  const getActionBg = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'UPDATE': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'DELETE': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-slate-100 dark:bg-slate-900/30';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Inspections Today</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInspectionsToday || 0}</div>
            <p className="text-xs text-slate-500">Started since midnight</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verified Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVerified || 0}</div>
            <p className="text-xs text-slate-500">Total clean inspections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Flagged Exceptions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlagged || 0}</div>
            <p className="text-xs text-red-500 font-medium">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks || 0}</div>
            <p className="text-xs text-slate-500">Open tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {(!recentActivity || recentActivity.length === 0) && (
                <div className="text-sm text-slate-500">No recent activity detected.</div>
              )}
              {recentActivity?.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${getActionBg(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                      {formatActivityText(log)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                    {log.action}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
