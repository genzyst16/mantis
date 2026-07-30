import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSchedule } from "./actions";

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
        
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white shadow hover:bg-emerald-700 h-9 px-4 py-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
            </DialogHeader>
            <form action={async (formData: FormData) => {
              "use server";
              await createSchedule(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkpoint_id">Checkpoint</Label>
                <Select name="checkpoint_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Checkpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkpoints?.map(cp => (
                      <SelectItem key={cp.id} value={cp.id}>{cp.checkpoint_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule_type">Frequency</Label>
                <Select name="schedule_type" defaultValue="Daily" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input id="start_time" name="start_time" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_time">Due Time</Label>
                  <Input id="due_time" name="due_time" type="time" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Create Schedule</Button>
            </form>
          </DialogContent>
        </Dialog>
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
