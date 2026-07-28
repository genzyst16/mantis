"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Edit } from "lucide-react";
import { deleteTemplate, updateTemplate } from "@/app/actions/phase4";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function TemplateActions({ template }: { template: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(template.template_name);
  const [description, setDescription] = useState(template.description || "");
  const [fields, setFields] = useState<any[]>(template.inspection_template_fields || []);

  const addField = () => {
    setFields([...fields, { field_key: "", field_label: "", field_type: "text", is_required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) return alert("Add at least one parameter");
    
    // Auto-generate keys if missing
    const finalFields = fields.map(f => ({
      ...f,
      field_key: f.field_key || f.field_label.toLowerCase().replace(/[^a-z0-9]/g, '_')
    }));

    setIsSubmitting(true);
    const result = await updateTemplate(template.id, name, description, finalFields);

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to disable template "${template.template_name}"?`)) return;
    
    setIsDeleting(true);
    const res = await deleteTemplate(template.id);
    if (res.error) alert(res.error);
    setIsDeleting(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="sm" className="text-slate-500 hover:text-emerald-600" title="Edit Template" />}>
          <Edit className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template: {template.template_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} />
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
                <div key={idx} className="flex items-end gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <Label>Field Label</Label>
                    <Input required value={field.field_label} onChange={e => updateField(idx, "field_label", e.target.value)} />
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
                    <input type="checkbox" checked={field.is_required} onChange={e => updateField(idx, "is_required", e.target.checked)} id={`req-${template.id}-${idx}`} />
                    <Label htmlFor={`req-${template.id}-${idx}`}>Required</Label>
                  </div>
                  <Button type="button" variant="ghost" className="text-red-500 mb-1" onClick={() => removeField(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDelete}
        disabled={isDeleting || !template.is_active}
        className="text-slate-500 hover:text-red-600"
        title="Disable Template"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
