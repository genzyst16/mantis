"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Pencil, ChevronDown, KeyRound } from "lucide-react";
import { updatePersonnel, resetUserPassword } from "@/app/actions/personnel";

const ACCESS_LEVEL_OPTIONS = [
  { value: "dashboard", label: "Dashboard Only" },
  { value: "admin", label: "Admin Only" },
  { value: "both", label: "Both" },
];

export function EditPersonnelModal({ user, roles, properties }: { user: any; roles: any[]; properties: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [empNum, setEmpNum] = useState(user.employee_number || "");
  const [roleId, setRoleId] = useState(user.role_id || "");
  const [isActive, setIsActive] = useState(user.is_active ? "true" : "false");
  const [userType, setUserType] = useState<string>(user.user_type || "personnel");
  const [accessLevel, setAccessLevel] = useState<string>(user.access_level || "dashboard");
  
  // Extract property IDs from junction table mapping
  const initialPropertyIds = user.personnel_properties 
    ? user.personnel_properties.map((pp: any) => pp.property_id)
    : [];
  const [propertyIds, setPropertyIds] = useState<string[]>(initialPropertyIds);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const result = await updatePersonnel(user.id, {
      employee_number: empNum.trim() === "" ? null : empNum,
      role_id: roleId || null,
      is_active: isActive === "true",
      user_type: userType,
      access_level: accessLevel,
      propertyIds: propertyIds,
    });

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async () => {
    if (!confirm(`Are you sure you want to reset the password for ${user.full_name}?`)) return;
    setIsResetting(true);
    const result = await resetUserPassword(user.id);
    setIsResetting(false);
    if (result.error) {
      alert(result.error);
    } else {
      alert(`Password successfully reset!\n\nTemporary Password: ${result.tempPassword}\n\nThe user will be forced to change this upon logging in.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900" />}>
        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {user.full_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          <div className="space-y-2">
            <Label>Employee ID</Label>
            <Input value={empNum} onChange={e => setEmpNum(e.target.value)} placeholder="e.g. EMP-001" />
          </div>

          <div className="space-y-2">
            <Label>Assign Role</Label>
            <Select onValueChange={(v) => v && setRoleId(v)} value={roleId}>
              <SelectTrigger>
                <span className="truncate flex-1 text-left">{roleId ? roles.find(r => r.id === roleId)?.name : "No Role"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Role</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assigned Properties</Label>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <span className="truncate">
                  {propertyIds.length === 0 
                    ? "Select properties..." 
                    : propertyIds.length === 1 
                      ? properties.find(p => p.id === propertyIds[0])?.property_name 
                      : `${propertyIds.length} properties selected`}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                {properties.map(p => (
                  <DropdownMenuCheckboxItem
                    key={p.id}
                    checked={propertyIds.includes(p.id)}
                    onCheckedChange={(checked) => {
                      setPropertyIds(prev => checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                    }}
                  >
                    {p.property_name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User Category</Label>
              <Select onValueChange={(v) => v && setUserType(v)} value={userType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personnel">🦺 Personnel</SelectItem>
                  <SelectItem value="system">🖥️ System User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select onValueChange={(v) => v && setAccessLevel(v)} value={accessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVEL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={(v) => v && setIsActive(v)} value={isActive}>
              <SelectTrigger>
                <span className="truncate flex-1 text-left">{isActive === "true" ? "Active" : "Disabled"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-1/3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200" 
              onClick={handleResetPassword}
              disabled={isResetting || isSubmitting}
            >
              {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Reset Pass
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting || isResetting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
