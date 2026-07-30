import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "@/components/ExportButtons";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminEquipmentReportPage(props: { searchParams: Promise<{ property?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const propertyFilter = searchParams.property || "all";
  const categoryFilter = searchParams.category || "all";
  
  let query = supabase
    .from("equipment")
    .select(`
      *,
      properties(property_name),
      maintenance_areas(area_name)
    `)
    .order("equipment_name", { ascending: true });

  if (propertyFilter !== "all") {
    query = query.eq("property_id", propertyFilter);
  }
  if (categoryFilter !== "all") {
    query = query.eq("equipment_category", categoryFilter);
  }

  const { data: equipment, error } = await query.limit(500);
  const { data: properties } = await supabase.from("properties").select("id, property_name").eq("is_active", true);
  const { data: categories } = await supabase.from("equipment_categories").select("id, name").order("name");

  const excelData = (equipment || []).map(e => ({
    "Equipment Code": e.equipment_code,
    "Equipment Name": e.equipment_name,
    "Category": e.equipment_category,
    "Property": e.properties?.property_name || "N/A",
    "Maintenance Area": e.maintenance_areas?.area_name || "N/A",
    "Registered On": format(new Date(e.created_at), "MMM d, yyyy")
  }));

  const pdfColumns = ["Code", "Name", "Category", "Property", "Area", "Registered"];
  const pdfRows = (equipment || []).map(e => [
    e.equipment_code,
    e.equipment_name,
    e.equipment_category,
    e.properties?.property_name || "N/A",
    e.maintenance_areas?.area_name || "N/A",
    format(new Date(e.created_at), "MMM d, yyyy")
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filters Form */}
        <form className="flex flex-wrap items-end gap-3 w-full">
          <input type="hidden" name="property" value={propertyFilter} />
          
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <select 
              name="category" 
              defaultValue={categoryFilter}
              className="flex h-9 w-48 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-950"
            >
              <option value="all">All Categories</option>
              {categories?.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="h-9 px-4 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
            Filter
          </button>
          
          {categoryFilter !== 'all' && (
            <Link href={`/admin/reports/equipment?property=${propertyFilter}`} className="h-9 px-4 flex items-center justify-center bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="shrink-0">
          <ExportButtons 
            filename="MANTIS_Equipment" 
            pdfTitle="MANTIS Equipment Report"
            pdfColumns={pdfColumns}
            pdfRows={pdfRows}
            excelData={excelData}
          />
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <Link 
          href={`/admin/reports/equipment?property=all&category=${categoryFilter}`} 
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === 'all' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All Properties
        </Link>
        {properties?.map(p => (
          <Link 
            key={p.id}
            href={`/admin/reports/equipment?property=${p.id}&category=${categoryFilter}`} 
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${propertyFilter === p.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {p.property_name}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtered Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Location (Area)</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!equipment || equipment.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                    No equipment found matching your filters.
                  </TableCell>
                </TableRow>
              )}
              {equipment?.map((eq: any) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">{eq.equipment_code}</TableCell>
                  <TableCell>{eq.equipment_name}</TableCell>
                  <TableCell>{eq.equipment_category}</TableCell>
                  <TableCell>{eq.properties?.property_name || "N/A"}</TableCell>
                  <TableCell>{eq.maintenance_areas?.area_name || "N/A"}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(eq.created_at), "MMM d, yyyy")}
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
