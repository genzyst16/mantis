"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCorrectiveAction(formData: FormData) {
  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const finding_description = formData.get("finding_description") as string;
  const severity = formData.get("severity") as string;
  const action_required = formData.get("action_required") as string;
  const due_date = formData.get("due_date") as string;
  const property_id_raw = formData.get("property_id") as string;
  const property_id = property_id_raw && property_id_raw !== "none" ? property_id_raw : null;
  const assigned_user_id_raw = formData.get("assigned_user_id") as string;
  const assigned_user_id = assigned_user_id_raw && assigned_user_id_raw !== "unassigned" ? assigned_user_id_raw : null;
  const status = formData.get("status") as string;

  if (!finding_description || !severity) {
    return { error: "Task title and severity are required." };
  }

  const { error } = await supabase.from("corrective_actions").insert({
    finding_description,
    severity,
    action_required: action_required || null,
    due_date: due_date || null,
    property_id,
    assigned_user_id,
    created_by: user?.id || null,
    status: status ? status : (assigned_user_id ? "Assigned" : "Unassigned"),
  });

  if (error) {
    console.error("Error creating task:", error.message, error.details, error.hint);
    return { error: error.message };
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCorrectiveAction(taskId: string, formData: FormData) {
  const supabase = createAdminClient();
  
  const finding_description = formData.get("finding_description") as string;
  const severity = formData.get("severity") as string;
  const action_required = formData.get("action_required") as string;
  const due_date = formData.get("due_date") as string;
  const property_id_raw = formData.get("property_id") as string;
  const property_id = property_id_raw && property_id_raw !== "none" ? property_id_raw : null;
  const assigned_user_id_raw = formData.get("assigned_user_id") as string;
  const assigned_user_id = assigned_user_id_raw && assigned_user_id_raw !== "unassigned" ? assigned_user_id_raw : null;

  if (!finding_description || !severity) {
    return { error: "Task title and severity are required." };
  }

  // Fetch current to check if status needs changing based on assignment
  const { data: currentTask } = await supabase.from("corrective_actions").select("status").eq("id", taskId).single();
  let status = currentTask?.status || "Unassigned";
  if (status === "Unassigned" && assigned_user_id) status = "Assigned";
  if ((status === "Assigned" || status === "In Progress") && !assigned_user_id) status = "Unassigned";

  const { error } = await supabase.from("corrective_actions").update({
    finding_description,
    severity,
    action_required: action_required || null,
    due_date: due_date || null,
    property_id,
    assigned_user_id,
    status,
  }).eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateActionStatus(actionId: string, newStatus: string, remarks?: string, photoUrl?: string) {
  const supabase = createAdminClient();
  
  let updateData: any = { status: newStatus };
  if (newStatus === "Resolved" || newStatus === "Completed") {
    updateData.completed_at = new Date().toISOString();
  }
  if (remarks) updateData.completion_remarks = remarks;
  if (photoUrl) updateData.completion_photo_url = photoUrl;

  const { error } = await supabase
    .from("corrective_actions")
    .update(updateData)
    .eq("id", actionId);

  if (error) {
    console.error("Error updating task status:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function endorseAction(actionId: string, newAssigneeId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("corrective_actions")
    .update({ 
      assigned_user_id: newAssigneeId,
      status: "Assigned",
    })
    .eq("id", actionId);

  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(actionId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("corrective_actions")
    .delete()
    .eq("id", actionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function takeTaskAction(taskId: string) {
  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("corrective_actions")
    .update({ 
      assigned_user_id: user.id,
      status: "Assigned"
    })
    .eq("id", taskId)
    .eq("status", "Unassigned");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tasks/${taskId}`);
  return { success: true };
}
