"use server";

import { createClient } from "@/lib/supabase/server";

export async function getReportDetails(reportId: string) {
  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from("inspection_reports")
    .select(`
      *,
      checkpoints(
        checkpoint_name,
        inspection_templates(
          inspection_template_fields(field_key, field_label, field_type)
        )
      ),
      profiles(full_name, email),
      properties(property_name),
      inspection_values(*)
    `)
    .eq("id", reportId)
    .single();

  if (error) {
    console.error("Error fetching report:", error);
    return null;
  }
  return report;
}

export async function getPropertiesWithCheckpoints() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      id, 
      property_name,
      checkpoints(id, checkpoint_name)
    `)
    .eq("is_active", true)
    .order("property_name");
    
  return data || [];
}

export async function getCheckpointHistory(checkpointId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  
  let q = supabase
    .from("inspection_reports")
    .select(`
      id,
      reference_number,
      created_at,
      verification_status,
      profiles(full_name, email),
      inspection_values(field_key, text_value, numeric_value, boolean_value),
      checkpoints(
        inspection_templates(
          inspection_template_fields(field_key, field_label, field_type)
        )
      )
    `)
    .eq("checkpoint_id", checkpointId);

  if (startDate) {
    q = q.gte("created_at", `${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    q = q.lte("created_at", `${endDate}T23:59:59.999Z`);
  }

  const { data: reports, error } = await q
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  return reports || [];
}
