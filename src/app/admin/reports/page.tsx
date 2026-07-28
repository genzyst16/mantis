import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/ExportButtons";
import { ReportDetailsModal } from "@/components/ReportDetailsModal";
import { HistoricalReportsTab } from "@/components/HistoricalReportsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage(props: { searchParams: Promise<{ property?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const propertyFilter = searchParams.property || "all";
  
  // Fetch reports with related checkpoint and user data
  let query = supabase
    .from("inspection_reports")
    .select(`
      *,
      checkpoints(checkpoint_name, checkpoint_code),
      profiles(full_name, email),
      properties(property_name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (propertyFilter !== "all") {
    query = query.eq("property_id", propertyFilter);
  }

  const { data: reports, error } = await query;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inspection Reports</h2>
        <ExportButtons reports={reports || []} />
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Submissions</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4 m-0">
          <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
            <Link 
              href="/admin/reports?property=all" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === 'all' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              All Properties
            </Link>
            {properties?.map(p => (
              <Link 
                key={p.id}
                href={`/admin/reports?property=${p.id}`} 
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === p.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {p.property_name}
              </Link>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
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
                        No inspection reports found.
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
