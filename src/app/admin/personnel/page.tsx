import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUserPermissions, hasPermission } from "@/lib/permissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, HardHat, Monitor } from "lucide-react";
import Link from "next/link";
import { EnrollUserModal } from "@/components/EnrollUserModal";
import { EditPersonnelModal } from "@/components/EditPersonnelModal";
import { DeletePersonnelModal } from "@/components/DeletePersonnelModal";

export const dynamic = "force-dynamic";

const ACCESS_BADGE: Record<string, { label: string; className: string }> = {
  dashboard: { label: "Dashboard", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  admin:     { label: "Admin",     className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  both:      { label: "Both",      className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
};

export default async function AdminPersonnelPage() {
  const supabaseSession = await createClient();
  const { data: { user } } = await supabaseSession.auth.getUser();
  if (!user) return null;

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const userPerms = await getUserPermissions(supabaseSession, user.id);
  if (!hasPermission(userPerms, "users.view")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view personnel.</p>
      </div>
    );
  }

  const canManage = hasPermission(userPerms, "users.manage");
  
  const { data: allUsers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, employee_number, is_active, user_type, access_level, role_id, is_super_admin, roles(name), personnel_properties(property_id)")
    .order("full_name");

  const { data: roles } = await supabaseAdmin.from("roles").select("id, name");
  const { data: properties } = await supabaseAdmin.from("properties").select("id, property_name").eq("is_active", true).order("property_name");

  const propertyMap = new Map((properties ?? []).map(p => [p.id, p.property_name]));

  const personnel   = allUsers?.filter(u => u.user_type === "personnel" || !u.user_type) ?? [];
  const systemUsers = allUsers?.filter(u => u.user_type === "system") ?? [];

  const UserTable = ({ users }: { users: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Emp. ID</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-slate-500 py-10">
              No users in this category yet.
            </TableCell>
          </TableRow>
        )}
        {users.map((user: any) => {
          const access = ACCESS_BADGE[user.access_level] ?? ACCESS_BADGE["dashboard"];
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell className="text-slate-500 text-sm">{user.email}</TableCell>
              <TableCell className="text-slate-500 text-sm">{user.employee_number || <span className="italic text-slate-300">—</span>}</TableCell>
              <TableCell className="text-sm">
                {user.personnel_properties && user.personnel_properties.length > 0
                  ? (
                    <div className="flex flex-wrap gap-1">
                      {user.personnel_properties.map((pp: any) => {
                        const propName = propertyMap.get(pp.property_id);
                        if (!propName) return null;
                        return (
                          <Badge key={pp.property_id} variant="outline" className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-normal">
                            {propName}
                          </Badge>
                        );
                      })}
                    </div>
                  )
                  : <span className="italic text-slate-300">—</span>}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                  {roles?.find(r => r.id === user.role_id)?.name || "No Role"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={access.className}>{access.label}</Badge>
              </TableCell>
              <TableCell>
                {user.is_active ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">Active</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {canManage ? (
                  <div className="flex items-center justify-end">
                    <EditPersonnelModal user={user} roles={roles || []} properties={properties || []} />
                    <DeletePersonnelModal user={user} />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">View Only</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Personnel</h2>
        <div className="flex gap-2">
          {canManage && (
            <Link href="/admin/roles">
              <Button variant="outline" className="border-slate-200">
                <Shield className="mr-2 h-4 w-4" /> Manage Roles
              </Button>
            </Link>
          )}
          {canManage && <EnrollUserModal roles={roles || []} properties={properties || []} />}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <HardHat className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{personnel.length}</p>
            <p className="text-xs text-slate-500">Maintenance Personnel</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemUsers.length}</p>
            <p className="text-xs text-slate-500">System Users</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{(allUsers?.filter(u => u.is_active) ?? []).length}</p>
            <p className="text-xs text-slate-500">Active Total</p>
          </div>
        </div>
      </div>

      {/* Personnel Section */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <HardHat className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Maintenance Personnel</CardTitle>
              <CardDescription>Field workers who perform inspections and tasks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable users={personnel} />
        </CardContent>
      </Card>

      {/* System Users Section */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle>System Users</CardTitle>
              <CardDescription>Administrators, managers, and supervisors who configure and monitor the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable users={systemUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
