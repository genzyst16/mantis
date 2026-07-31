"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, UserX } from "lucide-react";
import { deletePersonnel } from "@/app/actions/personnel";

export function DeletePersonnelModal({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user.is_super_admin) {
    return (
      <Button variant="ghost" size="sm" className="text-slate-300 cursor-not-allowed" title="Super Admin cannot be deleted" disabled>
        <UserX className="h-4 w-4" />
      </Button>
    );
  }

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const result = await deletePersonnel(user.id);

      if (result && (result as any).error) {
        alert(typeof (result as any).error === 'object' ? JSON.stringify((result as any).error) : String((result as any).error));
        setIsSubmitting(false);
      } else {
        setOpen(false);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      alert(`Client-side Exception: ${e.message || JSON.stringify(e)}`);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" title="Delete Account" />}>
        <UserX className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Personnel Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete the account for <strong>{user.full_name}</strong>?
            <br /><br />
            This action cannot be undone. All associated data will be removed.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4 flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Yes, Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
