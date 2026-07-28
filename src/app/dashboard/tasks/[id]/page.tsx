import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ClientTaskDetails } from "./ClientTaskDetails";

export default async function MobileTaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: task, error } = await supabase
    .from("corrective_actions")
    .select(`
      *,
      inspection_reports(reference_number, checkpoints(checkpoint_name, property_id))
    `)
    .eq("id", resolvedParams.id)
    .single();

  if (error || !task) {
    notFound();
  }

  // Fetch personnel matching the same property_id for endorsing
  const propertyId = task.inspection_reports?.checkpoints?.property_id;
  
  let personnelData: any[] = [];
  if (propertyId) {
    // Ideally we'd join on a personnel_properties junction, but since we don't have that explicitly mapped,
    // we just fetch all profiles. We can update this later if we need strict property tagging constraints.
    const { data: p } = await supabase.from("profiles").select("id, full_name");
    personnelData = p || [];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 pb-20">
      <ClientTaskDetails 
        task={task} 
        personnel={personnelData} 
        currentUserId={user.id} 
      />
    </div>
  );
}
