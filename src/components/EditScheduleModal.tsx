"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { updateSchedule } from "@/app/admin/schedules/actions";

export function EditScheduleModal({ schedule, checkpoints }: { schedule: any, checkpoints: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isActive, setIsActive] = useState(schedule.is_active);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) {
        setIsActive(schedule.is_active);
      }
    }}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Schedule" />}>
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
        </DialogHeader>
        <form action={async (formData: FormData) => {
          setIsSubmitting(true);
          formData.append("id", schedule.id);
          formData.append("is_active", String(isActive));
          const res = await updateSchedule(formData);
          setIsSubmitting(false);
          if (res?.error) {
            alert(res.error);
          } else {
            setOpen(false);
          }
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkpoint_id">Checkpoint</Label>
            <Select name="checkpoint_id" defaultValue={schedule.checkpoint_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Checkpoint" />
              </SelectTrigger>
              <SelectContent>
                {checkpoints.map(cp => (
                  <SelectItem key={cp.id} value={cp.id}>{cp.checkpoint_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schedule_type">Frequency</Label>
            <Select name="schedule_type" defaultValue={schedule.schedule_type} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input type="time" name="start_time" defaultValue={schedule.start_time?.slice(0,5)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_time">Due Time</Label>
              <Input type="time" name="due_time" defaultValue={schedule.due_time?.slice(0,5)} required />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="edit-active">Active</Label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
