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

export async function updateSchedule(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get("id") as string;
  const checkpoint_id = formData.get("checkpoint_id") as string;
  const schedule_type = formData.get("schedule_type") as string;
  const start_time = formData.get("start_time") as string;
  const due_time = formData.get("due_time") as string;
  const is_active = formData.get("is_active") === "true";

  const { error } = await supabase.from("inspection_schedules").update({
    checkpoint_id,
    schedule_type,
    start_time,
    due_time,
    is_active,
    recurrence_rule: schedule_type === 'Daily' ? 'FREQ=DAILY' : null,
  }).eq("id", id);

  if (error) {
    console.error("Error updating schedule:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/schedules");
  return { success: true };
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("inspection_schedules").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/schedules");
  return { success: true };
}
