import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientForm } from "./ClientForm";

// Fallback template if checkpoint has no template assigned
const FALLBACK_TEMPLATE = [
  { field_key: "status", field_label: "Status", field_type: "dropdown", is_required: true, options_json: ["Good", "Needs Repair"] },
  { field_key: "remarks", field_label: "Remarks", field_type: "textarea", is_required: false },
  { field_key: "photo", field_label: "General Photo", field_type: "photo", is_required: true },
];

export default async function InspectionFormPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Get scan session to find checkpoint
  const { data: session } = await supabase
    .from("scan_sessions")
    .select("checkpoint_id")
    .eq("id", sessionId)
    .single();

  if (!session) return notFound();

  // 2. Get Checkpoint to find template
  const { data: checkpointTemplate } = await supabaseAdmin
    .from("checkpoint_templates")
    .select("template_id")
    .eq("checkpoint_id", session.checkpoint_id)
    .maybeSingle();

  let fields = FALLBACK_TEMPLATE;

  if (checkpointTemplate?.template_id) {
    // 3. Fetch fields for template
    const { data: fetchedFields } = await supabase
      .from("inspection_template_fields")
      .select("*")
      .eq("template_id", checkpointTemplate.template_id)
      .order("display_order", { ascending: true });
      
    if (fetchedFields && fetchedFields.length > 0) {
      fields = fetchedFields;
    }
  }

  return <ClientForm sessionId={sessionId} templateFields={fields} />;
}
