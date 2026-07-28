"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { addEquipment } from "@/app/actions/phase4";

export function AddEquipmentModal({ properties, categories }: { properties: any[], categories: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [propertyId, setPropertyId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return alert("Please select a property");
    
    setIsSubmitting(true);
    const result = await addEquipment({
      equipment_code: code,
      equipment_name: name,
      equipment_category: category,
      property_id: propertyId
    });

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
      setCode("");
      setName("");
      setCategory("");
      setPropertyId("");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700" />}>
        <Plus className="mr-2 h-4 w-4" /> Add Equipment
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Equipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Property</Label>
            <Select onValueChange={(v) => v && setPropertyId(v)} value={propertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.property_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Equipment Code / Tag Number</Label>
            <Input required value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. GEN-001" />
          </div>
          <div className="space-y-2">
            <Label>Equipment Name</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Generator" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(v) => v && setCategory(v)} value={category}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Equipment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

