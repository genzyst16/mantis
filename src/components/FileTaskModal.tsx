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

export function FileTaskModal({ properties, currentUserId }: { properties: any[], currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800">
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> File a Task
        </Button>
      } />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>File a Task / Concern</DialogTitle>
        </DialogHeader>
        <form action={async (formData: FormData) => {
          setIsSubmitting(true);
          
          // Auto-assign to the personnel who is filing it
          formData.append("assigned_user_id", currentUserId);

          const res = await createCorrectiveAction(formData);
          setIsSubmitting(false);
          if (res?.error) {
            alert(res.error);
          } else {
            setOpen(false);
          }
        }} className="space-y-4 pt-2">
          
          <div className="space-y-2">
            <Label htmlFor="finding_description">Task Title / Concern <span className="text-red-500">*</span></Label>
            <Input
              id="finding_description"
              name="finding_description"
              required
              placeholder="e.g. Broken pipe in lobby"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_required">Details / Action Required</Label>
            <Textarea
              id="action_required"
              name="action_required"
              placeholder="Describe the issue or what you did..."
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
                  <SelectItem value="Low">🟢 Low</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="High">🟠 High</SelectItem>
                  <SelectItem value="Critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_id">Property</Label>
              <Select name="property_id" defaultValue="none">
                <SelectTrigger id="property_id">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No Property —</SelectItem>
                  {properties?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.property_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Filing..." : "Submit Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
