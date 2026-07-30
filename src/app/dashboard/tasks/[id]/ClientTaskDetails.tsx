"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, Camera, Send, MapPin, Clock } from "lucide-react";
import { updateActionStatus, endorseAction, takeTaskAction } from "@/app/admin/tasks/actions";
import Link from "next/link";

export function ClientTaskDetails({ task, personnel, currentUserId }: { task: any; personnel: any[]; currentUserId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeStatus, setActiveStatus] = useState(task.status || "Assigned");

  // Flow states
  const [isEndorseOpen, setIsEndorseOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState("");

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "Endorsed") {
      setIsEndorseOpen(true);
      return;
    }
    if (newStatus === "Completed") {
      setIsCompleteOpen(true);
      return;
    }
    
    startTransition(async () => {
      await updateActionStatus(task.id, newStatus);
      setActiveStatus(newStatus);
    });
  };

  const handleTakeTask = () => {
    startTransition(async () => {
      await takeTaskAction(task.id);
      setActiveStatus("Assigned");
      router.push("/dashboard");
    });
  };

  const handleEndorse = () => {
    if (!selectedAssignee) return;
    startTransition(async () => {
      await endorseAction(task.id, selectedAssignee);
      router.push("/dashboard"); // Take them back to dashboard since it's no longer theirs
    });
  };

  const handleComplete = () => {
    if (!photoUrl) {
      setError("A completion photo is strictly required.");
      return;
    }
    if (!remarks.trim()) {
      setError("Please provide a completion explanation.");
      return;
    }
    startTransition(async () => {
      await updateActionStatus(task.id, "Completed", remarks, photoUrl);
      setActiveStatus("Completed");
      setIsCompleteOpen(false);
    });
  };

  const allowedStatuses = ["On-going", "Paused", "Pending", "Endorsed", "Completed"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm rounded-full">
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Details</h1>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Ref: {task.inspection_reports?.reference_number}</span>
            <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                task.severity === 'High' ? 'bg-red-100 text-red-700' :
                task.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
            }`}>
              {task.severity}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">{task.finding_description}</h2>
        </div>
        
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
            <MapPin className="h-4 w-4 text-emerald-500" />
            {task.inspection_reports?.checkpoints?.checkpoint_name || "Unknown Location"}
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
            <Clock className="h-4 w-4 text-emerald-500" />
            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Action Required */}
          <div>
            <Label className="text-xs text-slate-500 uppercase mb-1 block">Instructions</Label>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {task.action_required || "No specific instructions provided. Resolve the finding."}
            </p>
          </div>

          {/* Status Updater */}
          <div className="pt-4">
            <Label className="text-xs text-slate-500 uppercase mb-2 block">Current Status</Label>
            {activeStatus === "Unassigned" ? (
              <Button 
                onClick={handleTakeTask} 
                disabled={isPending} 
                className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white text-base font-bold rounded-xl shadow-md"
              >
                {isPending ? "Taking Task..." : "Take Task"}
              </Button>
            ) : activeStatus === "Completed" || activeStatus === "Closed" ? (
              <div className="w-full h-12 flex items-center justify-center bg-emerald-500 text-white font-bold rounded-xl shadow-md">
                {activeStatus}
              </div>
            ) : (
              <Select value={activeStatus} onValueChange={handleStatusChange} disabled={isPending}>
                <SelectTrigger className="h-14 bg-white shadow-sm border-slate-200 text-base font-semibold">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map(s => (
                    <SelectItem key={s} value={s} className="py-3 text-base">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endorse Modal */}
      <Dialog open={isEndorseOpen} onOpenChange={setIsEndorseOpen}>
        <DialogContent className="w-[90vw] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Endorse Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Reassign this task to another personnel member if you cannot complete it.</p>
            <Select value={selectedAssignee} onValueChange={(val) => val && setSelectedAssignee(val)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select personnel..." />
              </SelectTrigger>
              <SelectContent>
                {personnel.map(p => (
                  <SelectItem key={p.id} value={p.id} className="py-3">{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-12" onClick={() => setIsEndorseOpen(false)}>Cancel</Button>
            <Button onClick={handleEndorse} className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!selectedAssignee || isPending}>
              Confirm Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Modal */}
      <Dialog open={isCompleteOpen} onOpenChange={(open) => {
        setIsCompleteOpen(open);
        setError("");
      }}>
        <DialogContent className="w-[90vw] rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Proof of Completion (Required) <span className="text-red-500">*</span></Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 relative overflow-hidden h-40">
                {photoUrl ? (
                  <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover" alt="Proof" />
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Tap to snap a photo</p>
                  </>
                )}
                <Input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoUrl(URL.createObjectURL(file));
                      setError("");
                    }
                  }} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Completion Explanation (Required) <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="Explain the work you did to resolve the issue..." 
                className="min-h-[100px] resize-none"
                value={remarks}
                onChange={e => {
                  setRemarks(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="h-12 w-full sm:w-auto" onClick={() => setIsCompleteOpen(false)}>Cancel</Button>
            <Button onClick={handleComplete} className="h-12 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2" disabled={isPending}>
              <Send className="h-4 w-4" /> Submit Completion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
