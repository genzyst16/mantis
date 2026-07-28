import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapWrapper } from "@/components/MapWrapper";

export default async function AdminMapPage() {
  const supabase = await createClient();
  
  // Fetch active checkpoints
  const { data: checkpointsData } = await supabase
    .from("checkpoints")
    .select("id, checkpoint_name, latitude, longitude, allowed_radius_meters")
    .eq("is_active", true);

  // Fetch today's inspection reports for plotting
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const { data: reportsData } = await supabase
    .from("inspection_reports")
    .select(`
      id, 
      reference_number, 
      final_latitude, 
      final_longitude, 
      verification_status, 
      created_at,
      profiles(full_name, email)
    `)
    .gte("created_at", today.toISOString());

  // Format data for the component
  const checkpoints = checkpointsData?.map(cp => ({
    id: cp.id,
    name: cp.checkpoint_name,
    lat: cp.latitude,
    lng: cp.longitude,
    radius: cp.allowed_radius_meters
  })) || [];

  const scans = reportsData?.map(r => {
    const profile: any = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      reportRef: r.reference_number,
      lat: r.final_latitude,
      lng: r.final_longitude,
      status: r.verification_status,
      personnel: profile?.full_name || profile?.email || "Unknown",
      timestamp: r.created_at
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Map Reports</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Activity Map</CardTitle>
          <CardDescription>Blue pins represent checkpoints. Green/Red pins represent actual scans today.</CardDescription>
        </CardHeader>
        <CardContent>
          <MapWrapper checkpoints={checkpoints} scans={scans} />
        </CardContent>
      </Card>
    </div>
  );
}
