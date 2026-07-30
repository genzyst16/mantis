import { createClient } from "@/lib/supabase/server";
import { getUserPermissions, hasPermission } from "@/lib/permissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuditLogsExportButtons } from "@/components/AuditLogsExportButtons";

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userPerms = await getUserPermissions(supabase, user.id);
  // We'll use reports.view as the minimum clearance to view audit logs,
  // or you could restrict it to users.view / roles.view.
  if (!hasPermission(userPerms, "reports.view") && !hasPermission(userPerms, "roles.view")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view audit logs.</p>
      </div>
    );
  }

  // Fetch audit logs
  const { data: logs } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      previous_values_json,
      new_values_json,
      created_at,
      profiles ( full_name, email )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Audit Logs</h2>
        <AuditLogsExportButtons logs={logs || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>Track all critical actions performed across MANTIS.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!logs || logs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {logs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.profiles?.full_name || log.profiles?.email || 'System'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      log.action === 'INSERT' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' :
                      log.action === 'UPDATE' ? 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/20' :
                      log.action === 'DELETE' ? 'text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20' :
                      'text-slate-600 border-slate-200'
                    }>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.entity_type}</div>
                    <span className="text-xs text-slate-400 font-mono" title={log.entity_id}>
                      {log.entity_id?.split('-')[0]}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-8 px-3">
                        View Data
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Audit Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400">Previous Values</h4>
                            <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-xs overflow-x-auto text-slate-800 dark:text-slate-200">
                              {log.previous_values_json ? JSON.stringify(log.previous_values_json, null, 2) : 'None / N/A'}
                            </pre>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400">New Values</h4>
                            <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-xs overflow-x-auto text-slate-800 dark:text-slate-200">
                              {log.new_values_json ? JSON.stringify(log.new_values_json, null, 2) : 'None / N/A'}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
