"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
  const supabase = await createClient();
  
  const checkpoint_id = formData.get("checkpoint_id") as string;
  const schedule_type = formData.get("schedule_type") as string;
  const start_time = formData.get("start_time") as string;
  const due_time = formData.get("due_time") as string;
  
  // We should link this to the generator template we conceptually built.
  // We'll just fetch any active template for the MVP.
  const { data: template } = await supabase
    .from("inspection_templates")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .single();
  
  const template_id = template?.id || null;

  const { error } = await supabase.from("inspection_schedules").insert({
    checkpoint_id,
    template_id,
    schedule_type,
    start_time,
    due_time,
    recurrence_rule: schedule_type === 'Daily' ? 'FREQ=DAILY' : null,
  });

  if (error) {
    console.error("Error creating schedule:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/schedules");
  return { success: true };
}
