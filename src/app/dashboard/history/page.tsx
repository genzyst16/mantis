import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

type ActivityItem = {
  id: string;
  type: 'inspection' | 'task';
  title: string;
  subtitle: string;
  date: Date;
  status: string;
};

import { HistoryDateFilter } from '@/components/HistoryDateFilter';

export default async function HistoryPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const fromDate = typeof searchParams.from === "string" ? searchParams.from : null;
  const toDate = typeof searchParams.to === "string" ? searchParams.to : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Inspections
  let reportsQuery = supabase
    .from('inspection_reports')
    .select('id, reference_number, created_at, verification_status, checkpoints(checkpoint_name)')
    .eq('user_id', user.id); // Fixed from 'inspected_by' to 'user_id'

  if (fromDate) reportsQuery = reportsQuery.gte('created_at', fromDate);
  if (toDate) reportsQuery = reportsQuery.lte('created_at', `${toDate}T23:59:59.999Z`);

  const { data: reports } = await reportsQuery
    .order('created_at', { ascending: false })
    .limit(fromDate || toDate ? 1000 : 30);

  // Fetch Completed, Filed, and Endorsed Tasks
  let tasksQuery = supabase
    .from('corrective_actions')
    .select('id, finding_description, status, completed_at, created_at, created_by, assigned_user_id, properties(property_name)')
    .or(`assigned_user_id.eq.${user.id},created_by.eq.${user.id}`);

  if (fromDate) tasksQuery = tasksQuery.gte('created_at', fromDate);
  if (toDate) tasksQuery = tasksQuery.lte('created_at', `${toDate}T23:59:59.999Z`);

  const { data: tasks } = await tasksQuery
    .order('created_at', { ascending: false })
    .limit(fromDate || toDate ? 1000 : 30);

  // Unified List
  const activities: ActivityItem[] = [];

  if (reports) {
    reports.forEach(r => {
      const checkpoint = r.checkpoints as any;
      activities.push({
        id: r.id,
        type: 'inspection',
        title: checkpoint?.checkpoint_name || 'Unknown Checkpoint',
        subtitle: `Ref: ${r.reference_number}`,
        date: new Date(r.created_at),
        status: r.verification_status || 'Submitted'
      });
    });
  }

  if (tasks) {
    tasks.forEach(t => {
      const property = t.properties as any;
      const isFiled = t.created_by === user.id && t.assigned_user_id !== user.id;
      let subtitle = property?.property_name ? `At ${property.property_name}` : 'General Task';
      if (isFiled) subtitle = `Filed by You • ${subtitle}`;
      else subtitle = `Assigned to You • ${subtitle}`;

      activities.push({
        id: t.id,
        type: 'task',
        title: t.finding_description || 'Task',
        subtitle: subtitle,
        date: new Date(t.created_at),
        status: t.status
      });
    });
  }

  // Sort descending by date
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Activity History</h2>
        <p className="text-slate-500 text-sm mb-6">Your recent inspections and tasks.</p>
        <HistoryDateFilter />
      </header>

      {activities.length === 0 ? (
        <Card className="border-dashed shadow-none bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Clock className="h-12 w-12 mb-3 text-slate-300" />
            <p>No recent activity found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {activities.map((activity, index) => (
            <div key={`${activity.type}-${activity.id}-${index}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 relative">
                {activity.type === 'inspection' ? (
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Wrench className="w-4 h-4 text-blue-600" />
                )}
              </div>

              {/* Card */}
              <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-slate-800 leading-tight">
                      {activity.title}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{activity.subtitle}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {activity.status === 'Passed' || activity.status === 'Closed' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : activity.status === 'Flagged' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span className={
                        activity.status === 'Passed' || activity.status === 'Closed' ? 'text-emerald-700' :
                        activity.status === 'Flagged' ? 'text-amber-700' : 'text-blue-700'
                      }>
                        {activity.status}
                      </span>
                    </div>
                    <time className="text-[10px] text-slate-400 font-medium">
                      {activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </CardContent>
              </Card>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
