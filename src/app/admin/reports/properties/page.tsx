import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/ExportButtons";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesReportPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const statusFilter = searchParams.status || "all";
  
  let query = supabase
    .from("properties")
    .select(`*`)
    .order("property_name", { ascending: true });

  if (statusFilter === "active") {
    query = query.eq("is_active", true);
  } else if (statusFilter === "inactive") {
    query = query.eq("is_active", false);
  }

  const { data: properties, error } = await query.limit(500);

  const excelData = (properties || []).map(p => ({
    "Property Name": p.property_name,
    "Description": p.description || "None",
    "Status": p.is_active ? "Active" : "Inactive",
    "Created At": format(new Date(p.created_at), "MMM d, yyyy")
  }));

  const pdfColumns = ["Property Name", "Description", "Status", "Created At"];
  const pdfRows = (properties || []).map(p => [
    p.property_name,
    p.description || "None",
    p.is_active ? "Active" : "Inactive",
    format(new Date(p.created_at), "MMM d, yyyy")
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filters Form */}
        <form className="flex flex-wrap items-end gap-3 w-full">
          
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select 
              name="status" 
              defaultValue={statusFilter}
              className="flex h-9 w-48 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-950"
            >
              <option value="all">All Properties</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button type="submit" className="h-9 px-4 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
            Filter
          </button>
          
          {statusFilter !== 'all' && (
            <Link href={`/admin/reports/properties`} className="h-9 px-4 flex items-center justify-center bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="shrink-0">
          <ExportButtons 
            filename="MANTIS_Properties" 
            pdfTitle="MANTIS Properties Report"
            pdfColumns={pdfColumns}
            pdfRows={pdfRows}
            excelData={excelData}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtered Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!properties || properties.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                    No properties found matching your filters.
                  </TableCell>
                </TableRow>
              )}
              {properties?.map((prop: any) => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium">{prop.property_name}</TableCell>
                  <TableCell className="text-slate-500 max-w-xs truncate">{prop.description || "—"}</TableCell>
                  <TableCell>
                    {prop.is_active 
                      ? <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge> 
                      : <Badge variant="secondary">Inactive</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(prop.created_at), "MMM d, yyyy")}
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
