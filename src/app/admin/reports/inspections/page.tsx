import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/ExportButtons";
import { ReportDetailsModal } from "@/components/ReportDetailsModal";
import { HistoricalReportsTab } from "@/components/HistoricalReportsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = 'force-dynamic';

export default async function AdminInspectionsReportPage(props: { searchParams: Promise<{ property?: string; start?: string; end?: string; status?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const propertyFilter = searchParams.property || "all";
  const startFilter = searchParams.start || "";
  const endFilter = searchParams.end || "";
  const statusFilter = searchParams.status || "all";
  
  // Fetch reports with related checkpoint and user data
  let query = supabase
    .from("inspection_reports")
    .select(`
      *,
      checkpoints(checkpoint_name, checkpoint_code),
      profiles(full_name, email),
      properties(property_name)
    `)
    .order("created_at", { ascending: false });

  if (propertyFilter !== "all") {
    query = query.eq("property_id", propertyFilter);
  }
  if (statusFilter !== "all") {
    query = query.eq("verification_status", statusFilter);
  }
  if (startFilter) {
    query = query.gte("created_at", `${startFilter}T00:00:00.000Z`);
  }
  if (endFilter) {
    query = query.lte("created_at", `${endFilter}T23:59:59.999Z`);
  }

  const { data: reports, error } = await query.limit(500);
  const { data: properties } = await supabase.from("properties").select("id, property_name").eq("is_active", true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-emerald-500">{status}</Badge>;
      case "Partially Verified":
        return <Badge className="bg-amber-500">{status}</Badge>;
      case "Flagged":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const excelData = (reports || []).map(r => ({
    "Reference Number": r.reference_number,
    "Checkpoint": r.checkpoints?.checkpoint_name || "Unknown",
    "Personnel": r.profiles?.full_name || r.profiles?.email || "Unknown",
    "Date": new Date(r.created_at).toLocaleDateString(),
    "Time": new Date(r.created_at).toLocaleTimeString(),
    "Status": r.verification_status,
    "Distance (m)": r.final_distance_meters ? Math.round(r.final_distance_meters) : "N/A"
  }));

  const pdfColumns = ["Reference", "Checkpoint", "Personnel", "Date & Time", "Status", "Dist(m)"];
  const pdfRows = (reports || []).map(r => [
    r.reference_number,
    r.checkpoints?.checkpoint_name || "Unknown",
    r.profiles?.full_name || r.profiles?.email || "Unknown",
    new Date(r.created_at).toLocaleString(),
    r.verification_status,
    r.final_distance_meters ? Math.round(r.final_distance_meters).toString() : "N/A"
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              <option value="Verified">Verified</option>
              <option value="Partially Verified">Partially Verified</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">From Date</Label>
            <Input type="date" name="start" defaultValue={startFilter} className="h-9" />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">To Date</Label>
            <Input type="date" name="end" defaultValue={endFilter} className="h-9" />
          </div>

          <button type="submit" className="h-9 px-4 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
            Filter
          </button>
          
          {(startFilter || endFilter || statusFilter !== 'all') && (
            <Link href={`/admin/reports/inspections?property=${propertyFilter}`} className="h-9 px-4 flex items-center justify-center bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="shrink-0">
          <ExportButtons 
            filename="MANTIS_Inspections" 
            pdfTitle="MANTIS Inspection Reports"
            pdfColumns={pdfColumns}
            pdfRows={pdfRows}
            excelData={excelData}
          />
        </div>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Submissions</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4 m-0">
          <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
            <Link 
              href={`/admin/reports/inspections?property=all&start=${startFilter}&end=${endFilter}&status=${statusFilter}`} 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === 'all' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              All Properties
            </Link>
            {properties?.map(p => (
              <Link 
                key={p.id}
                href={`/admin/reports/inspections?property=${p.id}&start=${startFilter}&end=${endFilter}&status=${statusFilter}`} 
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === p.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {p.property_name}
              </Link>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filtered Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Checkpoint</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!reports || reports.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-500 py-6">
                        No inspection reports found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                  {reports?.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium text-xs">{report.reference_number}</TableCell>
                      <TableCell>{report.properties?.property_name || "Unknown"}</TableCell>
                      <TableCell>{report.checkpoints?.checkpoint_name || "Unknown"}</TableCell>
                      <TableCell>{report.profiles?.full_name || report.profiles?.email || "Unknown"}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(report.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.verification_status)}</TableCell>
                      <TableCell className="text-right text-sm">
                        {report.final_distance_meters !== null ? `${Math.round(report.final_distance_meters)}m` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <ReportDetailsModal reportId={report.id} referenceNumber={report.reference_number} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historical" className="m-0">
          <HistoricalReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
