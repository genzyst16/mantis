"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCheckpoint } from "@/app/admin/checkpoints/actions";

export function DeleteCheckpointModal({ checkpoint }: { checkpoint: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteCheckpoint(checkpoint.id);

    if (result.error) {
      alert(result.error);
      setIsSubmitting(false);
    } else {
      setOpen(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" title="Delete Checkpoint" />}>
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Checkpoint</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete checkpoint <strong>{checkpoint.checkpoint_code}</strong>?
            <br /><br />
            This action cannot be undone. Checkpoint history will be affected.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4 flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Yes, Delete Checkpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
