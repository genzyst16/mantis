"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { createSchedule } from "@/app/admin/schedules/actions";

export function CreateScheduleModal({ checkpoints }: { checkpoints: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white shadow hover:bg-emerald-700 h-9 px-4 py-2">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
        </DialogHeader>
        <form action={async (formData: FormData) => {
          setIsSubmitting(true);
          const res = await createSchedule(formData);
          setIsSubmitting(false);
          if (res?.error) {
            alert(res.error);
          } else {
            setOpen(false);
          }
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkpoint_id">Checkpoint</Label>
            <Select name="checkpoint_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Checkpoint">
                  {(val: string | null) => {
                    if (!val) return "Select Checkpoint";
                    const cp = checkpoints?.find((c: any) => c.id === val);
                    return cp ? cp.checkpoint_name : "Select Checkpoint";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {checkpoints?.map(cp => (
                  <SelectItem key={cp.id} value={cp.id} label={cp.checkpoint_name}>{cp.checkpoint_name}</SelectItem>
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
                <SelectItem value="Daily" label="Daily">Daily</SelectItem>
                <SelectItem value="Weekly" label="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly" label="Monthly">Monthly</SelectItem>
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
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
