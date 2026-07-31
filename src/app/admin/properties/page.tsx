import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddPropertyModal } from "@/components/AddPropertyModal";
import { getUserPermissions, hasPermission } from "@/lib/permissions";

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userPerms = await getUserPermissions(supabase, user.id);
  const canCreate = hasPermission(userPerms, "properties.create");
  
  const { data: properties } = await supabase
    .from("properties")
    .select("*, maintenance_areas(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Properties</h2>
        {canCreate && (
          <AddPropertyModal />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Areas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!properties || properties.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                    No properties found.
                  </TableCell>
                </TableRow>
              )}
              {properties?.map((prop: any) => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium">{prop.property_code}</TableCell>
                  <TableCell>{prop.property_name}</TableCell>
                  <TableCell>{prop.maintenance_areas?.[0]?.count || 0}</TableCell>
                  <TableCell>
                    {prop.is_active ? <Badge className="bg-emerald-100 text-emerald-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
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
