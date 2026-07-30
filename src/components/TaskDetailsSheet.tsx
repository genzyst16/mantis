"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Eye } from "lucide-react";
import { updateCorrectiveAction } from "@/app/admin/tasks/actions";

export function TaskDetailsSheet({ 
  task, 
  properties, 
  personnel 
}: { 
  task: any, 
  properties: any[], 
  personnel: any[] 
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [propertyId, setPropertyId] = useState(task.property_id || "none");
  const [assigneeId, setAssigneeId] = useState(task.assigned_user_id || "unassigned");
  const [severity, setSeverity] = useState(task.severity || "Medium");

  const isClosed = task.status === "Closed";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-500 hover:text-blue-600 mr-2" 
          title={isClosed ? "View Task" : "Edit Task"}
        >
          {isClosed ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      } />
      
      <SheetContent className="sm:max-w-md overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle>{isClosed ? "View Task Details" : "Edit Task"}</SheetTitle>
        </SheetHeader>
        
        <form action={async (formData: FormData) => {
          if (isClosed) return; // Prevent submission if closed
          setIsSubmitting(true);
          const result = await updateCorrectiveAction(task.id, formData);
          setIsSubmitting(false);
          if (result.error) {
            alert(result.error);
          } else {
            setOpen(false);
          }
        }} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="finding_description">Task Title / Issue Description {isClosed ? "" : <span className="text-red-500">*</span>}</Label>
            <Input
              id="finding_description"
              name="finding_description"
              required={!isClosed}
              disabled={isClosed}
              defaultValue={task.finding_description}
              placeholder="e.g. Replace broken fire extinguisher in Block A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_required">Action Required {isClosed ? "" : <span className="text-red-500">*</span>}</Label>
            <Textarea
              id="action_required"
              name="action_required"
              required={!isClosed}
              disabled={isClosed}
              defaultValue={task.action_required || ""}
              placeholder="Describe the specific steps the assignee needs to take..."
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity {isClosed ? "" : <span className="text-red-500">*</span>}</Label>
              <Select name="severity" value={severity} onValueChange={setSeverity} required={!isClosed} disabled={isClosed}>
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
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={task.due_date ? task.due_date.split('T')[0] : ""} disabled={isClosed} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_id">Property</Label>
              <Select name="property_id" value={propertyId} onValueChange={setPropertyId} disabled={isClosed}>
                <SelectTrigger id="property_id">
                  <span className="truncate flex-1 text-left">
                    {propertyId !== "none" ? properties?.find(p => p.id === propertyId)?.property_name : "— No Property —"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No Property —</SelectItem>
                  {properties?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.property_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_user_id">Assign To</Label>
              <Select name="assigned_user_id" value={assigneeId} onValueChange={setAssigneeId} disabled={isClosed}>
                <SelectTrigger id="assigned_user_id">
                  <span className="truncate flex-1 text-left">
                    {assigneeId !== "unassigned" 
                      ? (() => {
                          const p = personnel?.find(p => p.id === assigneeId);
                          return p ? (p.full_name || p.email || "Unknown") : "— Leave Unassigned —";
                        })()
                      : "— Leave Unassigned —"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
                  {personnel?.map((p: any) => {
                    const name = p.full_name || p.email || "Unknown";
                    return <SelectItem key={p.id} value={p.id}>{name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isClosed && (
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
