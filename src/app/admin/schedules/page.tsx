import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateScheduleModal } from "@/components/CreateScheduleModal";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const supabase = await createClient();
  
  const { data: schedules } = await supabase
    .from("inspection_schedules")
    .select("*, checkpoints(checkpoint_name, checkpoint_code)")
    .order("created_at", { ascending: false });

  const { data: checkpoints } = await supabase
    .from("checkpoints")
    .select("id, checkpoint_name")
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Schedules</h2>
        
        <CreateScheduleModal checkpoints={checkpoints || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Checkpoint</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!schedules || schedules.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                    No schedules found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {schedules?.map((schedule: any) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.checkpoints?.checkpoint_name}</TableCell>
                  <TableCell>{schedule.schedule_type}</TableCell>
                  <TableCell>{schedule.start_time?.slice(0,5)} - {schedule.due_time?.slice(0,5)}</TableCell>
                  <TableCell>
                    {schedule.is_active ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs font-medium">Inactive</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
