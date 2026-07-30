"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen } from "lucide-react";
import { updateActionStatus } from "@/app/admin/tasks/actions";

interface CloseTaskButtonProps {
  taskId: string;
  status: string;
  canClose: boolean;
}

export function CloseTaskButton({ taskId, status, canClose }: CloseTaskButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (!canClose || status !== "Completed" || isPending) return;
    startTransition(async () => {
      await updateActionStatus(taskId, "Closed");
    });
  };

  // Determine appearance based on status
  if (status === "Closed") {
    return (
      <Button variant="ghost" size="icon" disabled className="text-red-500 opacity-100 hover:text-red-500 hover:bg-transparent" title="Task is Closed">
        <Lock className="h-4 w-4" />
      </Button>
    );
  }

  if (status === "Completed") {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleClose}
        disabled={!canClose || isPending}
        className={`hover:bg-emerald-50 ${canClose ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300'}`}
        title={canClose ? "Confirm Closure (Mark as Closed)" : "You do not have permission to close tasks"}
      >
        <LockOpen className="h-4 w-4" />
      </Button>
    );
  }

  // Any other status (Unassigned, On-going, etc.)
  return (
    <Button variant="ghost" size="icon" disabled className="text-slate-300 hover:bg-transparent cursor-not-allowed" title="Task must be Completed before closing">
      <Lock className="h-4 w-4" />
    </Button>
  );
}
