"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, UserPlus, HardHat, Monitor, ChevronDown } from "lucide-react";
import { enrollPersonnel } from "@/app/actions/personnel";

const ACCESS_LEVEL_OPTIONS = [
  { value: "dashboard", label: "Dashboard Only", description: "Mobile field access" },
  { value: "admin", label: "Admin Only", description: "Back-office access" },
  { value: "both", label: "Both", description: "Full system access" },
];

export function EnrollUserModal({ roles, properties }: { roles: any[]; properties: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [propertyIds, setPropertyIds] = useState<string[]>([]);
  const [userType, setUserType] = useState<"personnel" | "system">("personnel");
  const [accessLevel, setAccessLevel] = useState("dashboard");
  
  const [forceChange, setForceChange] = useState(true);
  const [preventChange, setPreventChange] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<string>("0");

  // When user type changes, set sensible default access level
  const handleUserTypeChange = (type: "personnel" | "system") => {
    setUserType(type);
    setAccessLevel(type === "system" ? "admin" : "dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return alert("Please provide an initial password");
    
    setIsSubmitting(true);
    const result = await enrollPersonnel({
      name,
      email,
      roleId,
      password,
      forcePasswordChange: forceChange,
      preventPasswordChange: preventChange,
      passwordExpiresInDays: expiresInDays !== "0" ? parseInt(expiresInDays) : null,
      userType,
      accessLevel,
      propertyIds,
    });

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
      setName(""); setEmail(""); setPassword(""); setRoleId(""); setPropertyIds([]);
      setUserType("personnel"); setAccessLevel("dashboard");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700" />}>
        <UserPlus className="mr-2 h-4 w-4" /> Enroll User
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">

          {/* User Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">User Category</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUserTypeChange("personnel")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  userType === "personnel"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                }`}
              >
                <HardHat className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Personnel</p>
                  <p className="text-xs opacity-70">Maintenance worker</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange("system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  userType === "system"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Monitor className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold text-sm">System User</p>
                  <p className="text-xs opacity-70">Admin / Manager</p>
                </div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign Role</Label>
              <Select onValueChange={(v) => v && setRoleId(v)} value={roleId}>
                <SelectTrigger>
                  <span className="truncate flex-1 text-left">{roleId ? roles.find(r => r.id === roleId)?.name : "Select role..."}</span>
                </SelectTrigger>
                <SelectContent>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Password</Label>
              <Input type="text" required value={password} onChange={e => setPassword(e.target.value)} placeholder="TempPass123!" />
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">App Access Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCESS_LEVEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccessLevel(opt.value)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 text-center transition-all ${
                    accessLevel === opt.value
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-xs">{opt.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Password Policies */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Password Policies</h4>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="forceChange" checked={forceChange} onChange={e => setForceChange(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
              <Label htmlFor="forceChange" className="font-normal cursor-pointer">Change password on first login</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="preventChange" checked={preventChange} onChange={e => setPreventChange(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
              <Label htmlFor="preventChange" className="font-normal cursor-pointer">User can&apos;t change password</Label>
            </div>

            <div className="space-y-2">
              <Label>Password Expires In</Label>
              <Select onValueChange={(v) => v && setExpiresInDays(v)} value={expiresInDays}>
                <SelectTrigger><SelectValue placeholder="Never" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Never expires</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enroll User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
