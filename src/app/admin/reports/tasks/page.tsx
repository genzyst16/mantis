import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/ExportButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminTasksReportPage(props: { searchParams: Promise<{ property?: string; start?: string; end?: string; dueStart?: string; dueEnd?: string; status?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const propertyFilter = searchParams.property || "all";
  const startFilter = searchParams.start || "";
  const endFilter = searchParams.end || "";
  const dueStartFilter = searchParams.dueStart || "";
  const dueEndFilter = searchParams.dueEnd || "";
  const statusFilter = searchParams.status || "all";
  
  let query = supabase
    .from("corrective_actions")
    .select(`
      *,
      properties(property_name),
      profiles(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (propertyFilter !== "all") {
    query = query.eq("property_id", propertyFilter);
  }
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  
  // Created Date Range
  if (startFilter) {
    query = query.gte("created_at", `${startFilter}T00:00:00.000Z`);
  }
  if (endFilter) {
    query = query.lte("created_at", `${endFilter}T23:59:59.999Z`);
  }

  // Due Date Range
  if (dueStartFilter) {
    query = query.gte("due_date", `${dueStartFilter}T00:00:00.000Z`);
  }
  if (dueEndFilter) {
    query = query.lte("due_date", `${dueEndFilter}T23:59:59.999Z`);
  }

  const { data: tasks, error } = await query.limit(500);
  const { data: properties } = await supabase.from("properties").select("id, property_name").eq("is_active", true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      case "In Progress": return <Badge className="bg-amber-500 hover:bg-amber-600">{status}</Badge>;
      case "Resolved": return <Badge className="bg-emerald-500 hover:bg-emerald-600">{status}</Badge>;
      case "Closed": return <Badge className="bg-slate-500 hover:bg-slate-600">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High": return <Badge variant="destructive">{priority}</Badge>;
      case "Medium": return <Badge className="bg-amber-500 hover:bg-amber-600">{priority}</Badge>;
      case "Low": return <Badge className="bg-blue-500 hover:bg-blue-600">{priority}</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const excelData = (tasks || []).map(t => ({
    "Task Title": t.title,
    "Property": t.properties?.property_name || "N/A",
    "Assignee": t.profiles?.full_name || t.profiles?.email || "Unassigned",
    "Status": t.status,
    "Priority": t.priority,
    "Due Date": t.due_date ? format(new Date(t.due_date), "MMM d, yyyy") : "None",
    "Created At": new Date(t.created_at).toLocaleString()
  }));

  const pdfColumns = ["Title", "Property", "Assignee", "Status", "Priority", "Due Date", "Created At"];
  const pdfRows = (tasks || []).map(t => [
    t.title,
    t.properties?.property_name || "N/A",
    t.profiles?.full_name || t.profiles?.email || "Unassigned",
    t.status,
    t.priority,
    t.due_date ? format(new Date(t.due_date), "MMM d, yyyy") : "None",
    new Date(t.created_at).toLocaleString()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
        {/* Filters Form */}
        <form className="flex flex-wrap items-end gap-3 w-full">
          <input type="hidden" name="property" value={propertyFilter} />
          
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select 
              name="status" 
              defaultValue={statusFilter}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-950"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Created (From)</Label>
            <Input type="date" name="start" defaultValue={startFilter} className="h-9 w-32" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Created (To)</Label>
            <Input type="date" name="end" defaultValue={endFilter} className="h-9 w-32" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Due (From)</Label>
            <Input type="date" name="dueStart" defaultValue={dueStartFilter} className="h-9 w-32" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Due (To)</Label>
            <Input type="date" name="dueEnd" defaultValue={dueEndFilter} className="h-9 w-32" />
          </div>

          <button type="submit" className="h-9 px-4 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
            Filter
          </button>
          
          {(startFilter || endFilter || dueStartFilter || dueEndFilter || statusFilter !== 'all') && (
            <Link href={`/admin/reports/tasks?property=${propertyFilter}`} className="h-9 px-4 flex items-center justify-center bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="shrink-0 pt-6 xl:pt-0">
          <ExportButtons 
            filename="MANTIS_Tasks" 
            pdfTitle="MANTIS Tasks Report"
            pdfColumns={pdfColumns}
            pdfRows={pdfRows}
            excelData={excelData}
          />
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <Link 
          href={`/admin/reports/tasks?property=all&start=${startFilter}&end=${endFilter}&dueStart=${dueStartFilter}&dueEnd=${dueEndFilter}&status=${statusFilter}`} 
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === 'all' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All Properties
        </Link>
        {properties?.map(p => (
          <Link 
            key={p.id}
            href={`/admin/reports/tasks?property=${p.id}&start=${startFilter}&end=${endFilter}&dueStart=${dueStartFilter}&dueEnd=${dueEndFilter}&status=${statusFilter}`} 
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === p.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {p.property_name}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtered Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!tasks || tasks.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-6">
                    No tasks found matching your filters.
                  </TableCell>
                </TableRow>
              )}
              {tasks?.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.properties?.property_name || "N/A"}</TableCell>
                  <TableCell>{task.profiles?.full_name || task.profiles?.email || <span className="italic text-slate-400">Unassigned</span>}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell className="text-slate-500">
                    {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "None"}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(task.created_at), "MMM d, yyyy")}
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
