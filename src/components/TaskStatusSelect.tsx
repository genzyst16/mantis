"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateActionStatus, endorseAction } from "@/app/admin/tasks/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = ["Unassigned", "Assigned", "On-going", "Paused", "Endorsed", "Pending", "Completed", "Closed"];

export function TaskStatusSelect({ 
  taskId, 
  currentStatus,
  userRole,
  personnel 
}: { 
  taskId: string; 
  currentStatus: string;
  userRole: string;
  personnel: { id: string, full_name?: string, email?: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeStatus, setActiveStatus] = useState(currentStatus);
  
  // Dialog States
  const [isEndorseOpen, setIsEndorseOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  // Form States
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;

    if (newStatus === "Endorsed") {
      setIsEndorseOpen(true);
      return;
    }

    if (newStatus === "Completed") {
      setIsCompleteOpen(true);
      return;
    }

    // Immediate save for other statuses
    saveStatus(newStatus);
  };

  const saveStatus = (newStatus: string, extraRemarks?: string, extraPhotoUrl?: string) => {
    startTransition(async () => {
      await updateActionStatus(taskId, newStatus, extraRemarks, extraPhotoUrl);
      setActiveStatus(newStatus);
    });
  };

  const submitEndorse = () => {
    if (!selectedAssignee) return;
    startTransition(async () => {
      await endorseAction(taskId, selectedAssignee);
      setActiveStatus("Assigned");
      setIsEndorseOpen(false);
    });
  };

  const submitComplete = () => {
    saveStatus("Completed", remarks, photoUrl);
    setIsCompleteOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Resolved":
        return "bg-emerald-500 text-white border-transparent";
      case "Closed":
        return "bg-slate-700 text-white border-transparent";
      case "On-going":
        return "bg-purple-500 text-white border-transparent";
      case "Assigned":
        return "bg-blue-500 text-white border-transparent";
      case "Endorsed":
        return "bg-orange-500 text-white border-transparent";
      case "Pending":
      case "Paused":
        return "bg-amber-500 text-white border-transparent";
      case "Unassigned":
      default:
        return "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const canClose = userRole === "Supervisor" || userRole === "Team Leader" || userRole === "Admin";

  return (
    <>
      <Select value={activeStatus} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className={`h-8 w-32 text-xs font-semibold ${getStatusColor(activeStatus)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map(status => {
            if (status === "Closed" && !canClose) return null;
            return (
              <SelectItem key={status} value={status} label={status}>
                {status}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* ENDORSE DIALOG */}
      <Dialog open={isEndorseOpen} onOpenChange={setIsEndorseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Endorse Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New Assignee</Label>
              <Select value={selectedAssignee} onValueChange={(val) => val && setSelectedAssignee(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select personnel...">
                    {(val: string | null) => {
                      if (!val) return "Select personnel...";
                      const p = personnel.find((user) => user.id === val);
                      return p ? (p.full_name || p.email || "Unknown") : "Select personnel...";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {personnel.map(p => {
                    const name = p.full_name || p.email || "Unknown";
                    return <SelectItem key={p.id} value={p.id} label={name}>{name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEndorseOpen(false)}>Cancel</Button>
            <Button onClick={submitEndorse} className="bg-emerald-600 hover:bg-emerald-700">Confirm Endorsement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMPLETE DIALOG */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">
              As an Admin, providing a photo and remarks is optional but recommended for auditing.
            </p>
            <div className="space-y-2">
              <Label>Photo (Optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In a real app, upload to Supabase Storage here and get public URL
                  // For now, we mock it.
                  setPhotoUrl(URL.createObjectURL(file));
                }
              }} />
            </div>
            <div className="space-y-2">
              <Label>Completion Remarks</Label>
              <Textarea 
                placeholder="Briefly explain what was done..." 
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>Cancel</Button>
            <Button onClick={submitComplete} className="bg-emerald-600 hover:bg-emerald-700">Mark Completed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
