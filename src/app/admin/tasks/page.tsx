import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCorrectiveAction } from "./actions";
import { TaskStatusSelect } from "@/components/TaskStatusSelect";
import { DeleteTaskButton } from "@/components/DeleteTaskButton";
import { EditTaskModal } from "@/components/EditTaskModal";
import { getUserPermissions, hasPermission } from "@/lib/permissions";

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

  const rolesData: any = currentUserProfile?.roles;
  const userRole = (Array.isArray(rolesData) ? rolesData[0]?.name : rolesData?.name) || "Personnel";
  
  const { data: personnel } = await supabase
    .from("profiles")
    .select("id, full_name");
  
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
  const personnelMap = new Map((personnel || []).map((p: any) => [p.id, p.full_name]));
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
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white shadow hover:bg-emerald-700 h-9 px-4 py-2">
              + Create Task
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form action={async (formData: FormData) => {
                "use server";
                await createCorrectiveAction(formData);
              }} className="space-y-4 pt-2">
                
                <div className="space-y-2">
                  <Label htmlFor="finding_description">Task Title / Issue Description <span className="text-red-500">*</span></Label>
                  <Input
                    id="finding_description"
                    name="finding_description"
                    required
                    placeholder="e.g. Replace broken fire extinguisher in Block A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action_required">Action Required</Label>
                  <Textarea
                    id="action_required"
                    name="action_required"
                    placeholder="Describe the specific steps the assignee needs to take..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity <span className="text-red-500">*</span></Label>
                    <Select name="severity" defaultValue="Medium" required>
                      <SelectTrigger id="severity">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">🔴 Critical</SelectItem>
                        <SelectItem value="High">🟠 High</SelectItem>
                        <SelectItem value="Medium">🟡 Medium</SelectItem>
                        <SelectItem value="Low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input id="due_date" name="due_date" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_id">Property</Label>
                    <Select name="property_id" defaultValue="none">
                      <SelectTrigger id="property_id">
                        <SelectValue placeholder="No Property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— No Property —</SelectItem>
                        {properties?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.property_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_user_id">Assign To</Label>
                    <Select name="assigned_user_id" defaultValue="unassigned">
                      <SelectTrigger id="assigned_user_id">
                        <SelectValue placeholder="Leave Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
                        {personnel?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                  Submit Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                    {canManage ? (
                      <div className="flex items-center justify-end">
                        <EditTaskModal task={action} properties={properties || []} personnel={personnel || []} />
                        <DeleteTaskButton taskId={action.id} taskTitle={action.finding_description} />
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
