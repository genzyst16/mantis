"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteSchedule } from "@/app/admin/schedules/actions";

export function DeleteScheduleButton({ schedule }: { schedule: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this schedule? This may fail if it is referenced by active sessions.`)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await deleteSchedule(schedule.id);

      if (result && (result as any).error) {
        alert(typeof (result as any).error === 'object' ? JSON.stringify((result as any).error) : String((result as any).error));
      }
    } catch (e: any) {
      alert(`Client-side Exception: ${e.message || JSON.stringify(e)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isSubmitting}
      title="Delete Schedule"
    >
      <span className="sr-only">Delete</span>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
