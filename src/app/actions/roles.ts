"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRole(name: string, description: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert({ name, description });
  if (error) return { error: error.message };
  
  revalidatePath("/admin/roles");
  return { success: true };
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const supabase = await createClient();
  
  // 1. Delete existing permissions for this role
  const { error: delError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (delError) return { error: delError.message };

  // 2. Insert new permissions
  if (permissionIds.length > 0) {
    const inserts = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid }));
    const { error: insError } = await supabase.from("role_permissions").insert(inserts);
    if (insError) return { error: insError.message };
  }

  revalidatePath("/admin/roles");
  revalidatePath("/admin/roles");
  return { success: true };
}

export async function updateRole(roleId: string, name: string, description: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("roles").update({ name, description }).eq("id", roleId);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/roles");
  return { success: true };
}

export async function deleteRole(roleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/roles");
  return { success: true };
}
