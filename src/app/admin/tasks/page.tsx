import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { TaskStatusSelect } from "@/components/TaskStatusSelect";
import { DeleteTaskButton } from "@/components/DeleteTaskButton";
import { TaskDetailsSheet } from "@/components/TaskDetailsSheet";
import { CloseTaskButton } from "@/components/CloseTaskButton";
import { getUserPermissions, hasPermission } from "@/lib/permissions";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("roles(name)")
    .eq("id", user.id)
    .single();

  const userPerms = await getUserPermissions(supabase, user.id);
  if (!hasPermission(userPerms, "tasks.view")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view tasks.</p>
      </div>
    );
  }

  const canManage = hasPermission(userPerms, "tasks.manage");
  const canCloseGeneral = hasPermission(userPerms, "tasks.close") || userPerms.is_super_admin;

  const rolesData: any = currentUserProfile?.roles;
  const userRole = (Array.isArray(rolesData) ? rolesData[0]?.name : rolesData?.name) || "Personnel";
  
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: personnel, error: personnelError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email");
    
  if (personnelError) {
    console.error("Error fetching personnel with Admin Client:", personnelError);
  }
  
  const { data: rawActions } = await supabase
    .from("corrective_actions")
    .select("id, finding_description, severity, action_required, status, due_date, assigned_user_id, property_id, created_by")
    .order("created_at", { ascending: false });

  const { data: properties } = await supabase
    .from("properties")
    .select("id, property_name")
    .eq("is_active", true)
    .order("property_name");

  // Build a lookup map from profiles to join manually (avoids ambiguous FK hint issues)
  const personnelMap = new Map((personnel || []).map((p: any) => [p.id, p.full_name || p.email || "Unknown"]));
  const propertyMap = new Map((properties || []).map((p: any) => [p.id, p.property_name]));

  const actions = rawActions?.map(a => ({
    ...a,
    assigned_to_name: a.assigned_user_id ? (personnelMap.get(a.assigned_user_id) || "Unknown") : null,
    property_name: a.property_id ? (propertyMap.get(a.property_id) || "Unknown") : null,
    created_by_name: a.created_by ? (personnelMap.get(a.created_by) || "Unknown") : null,
  }));

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical": return <Badge variant="destructive">Critical</Badge>;
      case "High": return <Badge className="bg-orange-500">High</Badge>;
      case "Medium": return <Badge className="bg-amber-500">Medium</Badge>;
      case "Low": return <Badge className="bg-emerald-500">Low</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tasks</h2>
        
        {canManage && (
          <CreateTaskModal properties={properties || []} personnel={personnel || []} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Task</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!actions || actions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-10">
                    No tasks yet. Click &quot;+ Create Task&quot; to get started.
                  </TableCell>
                </TableRow>
              )}
              {actions?.map((action: any) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{action.finding_description}</p>
                    {action.action_required && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{action.action_required}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {action.property_name ? (
                      <span className="font-medium text-slate-700 dark:text-slate-300">{action.property_name}</span>
                    ) : (
                      <span className="text-slate-400 italic text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {action.created_by_name ? (
                      <span className="font-medium text-slate-600 dark:text-slate-300">{action.created_by_name}</span>
                    ) : (
                      <span className="text-slate-400 italic text-sm">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {action.assigned_to_name || (
                      <span className="text-slate-400 italic text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{getSeverityBadge(action.severity)}</TableCell>
                  <TableCell>
                    <TaskStatusSelect 
                      taskId={action.id} 
                      currentStatus={action.status || 'Unassigned'} 
                      userRole={userRole}
                      personnel={personnel || []}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {action.due_date ? new Date(action.due_date).toLocaleDateString() : <span className="text-slate-400">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <CloseTaskButton 
                        taskId={action.id} 
                        status={action.status} 
                        canClose={canCloseGeneral || action.created_by === user.id} 
                      />
                      
                      {canManage && (
                        <>
                          <TaskDetailsSheet 
                            task={action} 
                            properties={properties || []} 
                            personnel={personnel || []} 
                          />
                          <DeleteTaskButton taskId={action.id} taskTitle={action.finding_description} />
                        </>
                      )}
                    </div>
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
