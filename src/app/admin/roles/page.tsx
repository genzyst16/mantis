import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateRoleModal } from "@/components/CreateRoleModal";
import { ConfigurePermissionsModal } from "@/components/ConfigurePermissionsModal";
import { EditRoleModal } from "@/components/EditRoleModal";
import { DeleteRoleButton } from "@/components/DeleteRoleButton";
import { getUserPermissions, hasPermission } from "@/lib/permissions";

export default async function AdminRolesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userPerms = await getUserPermissions(supabase, user.id);
  if (!hasPermission(userPerms, "roles.view")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view system roles.</p>
      </div>
    );
  }

  const canManage = hasPermission(userPerms, "roles.manage");

  // Fetch roles and their permissions count
  const { data: roles } = await supabase
    .from("roles")
    .select(`
      id,
      name,
      description,
      role_permissions ( permission_id, permissions(permission_key) )
    `)
    .order("name");

  const { data: allPermissions } = await supabase.from("permissions").select("*").order("permission_key");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Role Management</h2>
        {canManage && <CreateRoleModal />}
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>Roles dictate the permissions users have across MANTIS.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!roles || roles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
              {roles?.map((role: any) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-slate-500">{role.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {role.role_permissions?.length || 0} permissions
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage ? (
                      <div className="flex justify-end gap-2 items-center">
                        <ConfigurePermissionsModal role={role} allPermissions={allPermissions || []} />
                        <EditRoleModal role={role} />
                        <DeleteRoleButton roleId={role.id} roleName={role.name} />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">View Only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
