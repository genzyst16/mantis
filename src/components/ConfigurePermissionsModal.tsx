"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { updateRolePermissions } from "@/app/actions/roles";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ConfigurePermissionsModal({ role, allPermissions }: { role: any, allPermissions: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize with currently assigned permission IDs
  const initialSelected = role.role_permissions ? role.role_permissions.map((rp: any) => rp.permission_id) : [];
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const result = await updateRolePermissions(role.id, selectedIds);

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  // Group permissions by prefix
  const categories = allPermissions.reduce((acc, perm) => {
    const category = perm.permission_key.split('.')[0];
    const catName = category.charAt(0).toUpperCase() + category.slice(1);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="font-normal" />}>
        Configure
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Permissions: {role.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-4 py-4 space-y-6">
          {Object.keys(categories).map(category => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories[category].map((permission: any) => {
                  const isChecked = selectedIds.includes(permission.id);
                  return (
                    <div 
                      key={permission.id} 
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${isChecked ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                      onClick={() => handleToggle(permission.id)}
                    >
                      <Switch 
                        checked={isChecked} 
                        onCheckedChange={() => handleToggle(permission.id)} 
                        className="mt-0.5 data-[state=checked]:bg-emerald-600" 
                      />
                      <div className="flex flex-col space-y-1 leading-none">
                        <Label className="text-sm font-medium cursor-pointer text-slate-900 dark:text-white">
                          {permission.permission_key.split('.')[1].toUpperCase()}
                        </Label>
                        <span className="text-xs text-slate-500">{permission.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {allPermissions.length === 0 && (
            <div className="text-center text-sm text-slate-500 p-4">
              No permissions exist in the database. Please run the seed script!
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
