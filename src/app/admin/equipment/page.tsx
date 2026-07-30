import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Activity } from "lucide-react";
import { AddEquipmentModal } from "@/components/AddEquipmentModal";

export default async function AdminEquipmentPage() {
  const supabase = await createClient();
  
  const { data: equipmentList } = await supabase
    .from("equipment")
    .select("*, properties(property_name), maintenance_areas(area_name)")
    .order("created_at", { ascending: false });

  const { data: properties } = await supabase.from("properties").select("id, property_name");
  const { data: categories } = await supabase.from("equipment_categories").select("id, name").order("name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Equipment Registry</h2>
        <AddEquipmentModal properties={properties || []} categories={categories || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!equipmentList || equipmentList.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                    No equipment found.
                  </TableCell>
                </TableRow>
              )}
              {equipmentList?.map((eq: any) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">{eq.equipment_code}</TableCell>
                  <TableCell>{eq.equipment_name}</TableCell>
                  <TableCell>{eq.equipment_category}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {eq.properties?.property_name} - {eq.maintenance_areas?.area_name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/equipment/${eq.id}`}>
                      <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <Activity className="mr-2 h-4 w-4" /> View History
                      </Button>
                    </Link>
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
