import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddCategoryModal } from "@/components/AddCategoryModal";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from("equipment_categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Equipment Categories</h2>
        <AddCategoryModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Categories</CardTitle>
          <CardDescription>Define custom equipment classifications for your properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!categories || categories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500 py-6">
                    No categories found. Run the SQL migration to insert defaults.
                  </TableCell>
                </TableRow>
              )}
              {categories?.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-slate-500">{cat.description || "N/A"}</TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {new Date(cat.created_at).toLocaleDateString()}
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
