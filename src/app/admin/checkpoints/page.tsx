import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { QRCodeModal } from "@/components/QRCodeModal";
import { CreateCheckpointModal } from "@/components/CreateCheckpointModal";
import { EditCheckpointModal } from "@/components/EditCheckpointModal";
import { DeleteCheckpointModal } from "@/components/DeleteCheckpointModal";

export const dynamic = 'force-dynamic';

export default async function AdminCheckpointsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  const activeTab = searchParams.tab || "all";
  
  let query = supabaseAdmin
    .from("checkpoints")
    .select("*, inspection_templates(id, template_name)")
    .order("created_at", { ascending: false });

  if (activeTab !== "all") {
    query = query.eq("property_id", activeTab);
  }

  const { data: checkpoints } = await query;

  const { data: templates } = await supabase.from("inspection_templates").select("id, template_name").eq("is_active", true);
  const { data: properties } = await supabase.from("properties").select("id, property_name, property_code").eq("is_active", true);
  const { data: equipment } = await supabase.from("equipment").select("id, equipment_name, property_id").eq("status", "Active");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Checkpoints</h2>
        <CreateCheckpointModal properties={properties || []} equipment={equipment || []} templates={templates || []} />
      </div>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <Link 
          href="?tab=all" 
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          All Properties
        </Link>
        {properties?.map(p => (
          <Link 
            key={p.id}
            href={`?tab=${p.id}`} 
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === p.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {p.property_name}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Checkpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkpoints?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                    No checkpoints found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {checkpoints?.map((cp) => (
                <TableRow key={cp.id}>
                  <TableCell className="font-medium">{cp.checkpoint_code}</TableCell>
                  <TableCell>{cp.checkpoint_name}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {cp.requires_geofence ? (
                      <span className="flex flex-col">
                        <span>Lat: {cp.latitude?.toFixed(5)}</span>
                        <span>Lng: {cp.longitude?.toFixed(5)}</span>
                        <span>Radius: {cp.allowed_radius_meters}m</span>
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-200">No Geofence</Badge>
                    )}
                  </TableCell>
                  <TableCell>{cp.inspection_templates?.[0]?.template_name || 'None'}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <QRCodeModal token={cp.qr_token_hash} checkpointName={cp.checkpoint_name} />
                    <EditCheckpointModal checkpoint={cp} properties={properties || []} equipment={equipment || []} templates={templates || []} />
                    <DeleteCheckpointModal checkpoint={cp} />
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
