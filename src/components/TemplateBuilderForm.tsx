"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createTemplate } from "@/app/actions/phase4";
import { useRouter } from "next/navigation";

export function TemplateBuilderForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<any[]>([
    { field_key: "status", field_label: "Status", field_type: "dropdown", is_required: true, options: ["Good", "Fair", "Poor"] }
  ]);

  const addField = () => {
    setFields([...fields, { field_key: "", field_label: "", field_type: "text", is_required: false, max_length: null }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) return alert("Add at least one parameter");
    
    // Auto-generate keys if missing
    const finalFields = fields.map(f => ({
      ...f,
      field_key: f.field_key || f.field_label.toLowerCase().replace(/[^a-z0-9]/g, '_')
    }));

    setIsSubmitting(true);
    const result = await createTemplate(name, description, finalFields);

    if (result.error) {
      alert(result.error);
    } else {
      setName("");
      setDescription("");
      setFields([{ field_key: "status", field_label: "Status", field_type: "dropdown", is_required: true, options: ["Good", "Fair", "Poor"] }]);
      router.refresh();
      if (onSuccess) onSuccess();
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Builder</CardTitle>
        <CardDescription>Design custom checklists and parameters to assign to checkpoints.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Generator Routine" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Daily generator check" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <Label className="text-lg">Parameters</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            </div>
            
            {fields.map((field, idx) => (
              <div key={idx} className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                <div className="flex flex-wrap sm:flex-nowrap items-end gap-3">
                  <div className="flex-1 space-y-2 min-w-[200px]">
                    <Label>Field Label</Label>
                    <Input required value={field.field_label} onChange={e => updateField(idx, "field_label", e.target.value)} placeholder="e.g. Fuel Level" />
                  </div>
                  <div className="w-40 space-y-2">
                    <Label>Type</Label>
                    <Select onValueChange={v => updateField(idx, "field_type", v)} value={field.field_type}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 h-10 mb-1">
                    <input type="checkbox" checked={field.is_required} onChange={e => updateField(idx, "is_required", e.target.checked)} id={`req-${idx}`} />
                    <Label htmlFor={`req-${idx}`}>Required</Label>
                  </div>
                  <Button type="button" variant="ghost" className="text-red-500 mb-1" onClick={() => removeField(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Dynamic Configuration Row */}
                {field.field_type === 'dropdown' && (
                  <div className="w-full">
                    <Label className="text-xs text-slate-500 mb-1 block">Dropdown Options (comma separated)</Label>
                    <Input 
                      placeholder="e.g. Good, Fair, Needs Repair" 
                      value={field.raw_options !== undefined ? field.raw_options : (field.options ? field.options.join(', ') : "")}
                      onChange={(e) => {
                        updateField(idx, "raw_options", e.target.value);
                        updateField(idx, "options", e.target.value.split(',').map(s => s.trim()).filter(Boolean));
                      }}
                    />
                  </div>
                )}
                
                {(field.field_type === 'text' || field.field_type === 'number') && (
                  <div className="w-64">
                    <Label className="text-xs text-slate-500 mb-1 block">{field.field_type === 'text' ? 'Max Characters' : 'Max Digits'}</Label>
                    <Input 
                      type="number"
                      placeholder={field.field_type === 'text' ? "e.g. 100" : "e.g. 5"}
                      value={field.max_length || ""}
                      onChange={(e) => updateField(idx, "max_length", e.target.value ? parseInt(e.target.value, 10) : null)}
                    />
                  </div>
                )}
                
                {field.field_type === 'photo' && (
                  <div className="w-full text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-md border border-blue-200 dark:border-blue-900/50">
                    ℹ️ This parameter automatically triggers the device's native camera during scanning to securely capture and hash a photo.
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Template
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
