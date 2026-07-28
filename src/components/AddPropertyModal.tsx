"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { addProperty } from "@/app/actions/phase4";

export function AddPropertyModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const result = await addProperty(name, code);

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
      setCode("");
      setName("");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700" />}>
        <Plus className="mr-2 h-4 w-4" /> Add Property
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Property Code</Label>
            <Input required value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. WAREHOUSE-A" />
          </div>
          <div className="space-y-2">
            <Label>Property Name</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. North Wing Warehouse" />
          </div>
          
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Property
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
