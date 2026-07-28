import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateBuilderForm } from "@/components/TemplateBuilderForm";
import { TemplateActions } from "@/components/TemplateActions";

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  
  const { data: templates } = await supabase
    .from("inspection_templates")
    .select("*, inspection_template_fields(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inspection Templates</h2>
      </div>

      <Tabs defaultValue="list" className="w-full space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="list" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">All Templates</TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">Template Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Form Templates</CardTitle>
              <CardDescription>View and manage your inspection templates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!templates || templates.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                        No templates built yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {templates?.map((tmpl: any) => (
                    <TableRow key={tmpl.id}>
                      <TableCell className="font-medium">{tmpl.template_name}</TableCell>
                      <TableCell className="text-slate-500">{tmpl.description || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tmpl.inspection_template_fields?.length || 0} fields</Badge>
                      </TableCell>
                      <TableCell>
                        {tmpl.is_active ? <Badge className="bg-emerald-100 text-emerald-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <TemplateActions template={tmpl} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <TemplateBuilderForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
