"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { createCorrectiveAction } from "@/app/admin/tasks/actions";

export function CreateTaskModal({ properties, personnel }: { properties: any[], personnel: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2">
        <PlusCircle className="mr-2 h-4 w-4" /> Create Task
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form action={async (formData: FormData) => {
          setIsSubmitting(true);
          const res = await createCorrectiveAction(formData);
          setIsSubmitting(false);
          if (res?.error) {
            alert(res.error);
          } else {
            setOpen(false);
          }
        }} className="space-y-4 pt-2">
          
          <div className="space-y-2">
            <Label htmlFor="finding_description">Task Title / Issue Description <span className="text-red-500">*</span></Label>
            <Input
              id="finding_description"
              name="finding_description"
              required
              placeholder="e.g. Replace broken fire extinguisher in Block A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_required">Action Required</Label>
            <Textarea
              id="action_required"
              name="action_required"
              placeholder="Describe the specific steps the assignee needs to take..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity <span className="text-red-500">*</span></Label>
              <Select name="severity" defaultValue="Medium" required>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical" label="Critical">🔴 Critical</SelectItem>
                  <SelectItem value="High" label="High">🟠 High</SelectItem>
                  <SelectItem value="Medium" label="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="Low" label="Low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_id">Property</Label>
              <Select name="property_id" defaultValue="none">
                <SelectTrigger id="property_id">
                  <SelectValue placeholder="No Property">
                    {(val: string | null) => {
                      if (!val || val === "none") return "— No Property —";
                      const p = properties?.find((prop: any) => prop.id === val);
                      return p ? p.property_name : "— No Property —";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" label="— No Property —">— No Property —</SelectItem>
                  {properties?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} label={p.property_name}>{p.property_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_user_id">Assign To</Label>
              <Select name="assigned_user_id" defaultValue="unassigned">
                <SelectTrigger id="assigned_user_id">
                  <SelectValue placeholder="Leave Unassigned">
                    {(val: string | null) => {
                      if (!val || val === "unassigned") return "— Leave Unassigned —";
                      const p = personnel?.find((user: any) => user.id === val);
                      return p ? (p.full_name || p.email || "Unknown") : "— Leave Unassigned —";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" label="— Leave Unassigned —">— Leave Unassigned —</SelectItem>
                  {personnel?.map((p: any) => {
                    const name = p.full_name || p.email || "Unknown";
                    return <SelectItem key={p.id} value={p.id} label={name}>{name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Submit Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
