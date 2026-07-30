"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updatePersonnel(userId: string, data: { 
  employee_number?: string | null; 
  role_id?: string | null; 
  is_active?: boolean;
  user_type?: string;
  access_level?: string;
  propertyIds?: string[];
}) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { propertyIds, ...profileData } = data;
  const { error } = await supabaseAdmin.from("profiles").update(profileData).eq("id", userId);
  
  if (error) return { error: error.message };

  if (data.propertyIds !== undefined) {
    // Delete existing properties
    await supabaseAdmin.from("personnel_properties").delete().eq("user_id", userId);
    
    // Insert new properties
    if (data.propertyIds.length > 0) {
      const inserts = data.propertyIds.map(pid => ({ user_id: userId, property_id: pid }));
      await supabaseAdmin.from("personnel_properties").insert(inserts);
    }
  }

  revalidatePath("/admin/personnel");
  return { success: true };
}

export async function enrollPersonnel(data: {
  email: string;
  name: string;
  roleId: string;
  password?: string;
  forcePasswordChange: boolean;
  preventPasswordChange: boolean;
  passwordExpiresInDays: number | null;
  userType: string;
  accessLevel: string;
  propertyIds?: string[];
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local to enroll users." };
  }
  
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // 1. Create the user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password || "TempPass123!",
    email_confirm: true,
    user_metadata: { full_name: data.name }
  });
  
  if (authError) return { error: authError.message };
  
  // 2. Update the profile with role, password constraints, type, and access level
  if (authData.user) {
    let expiresAt = null;
    if (data.passwordExpiresInDays) {
      const d = new Date();
      d.setDate(d.getDate() + data.passwordExpiresInDays);
      expiresAt = d.toISOString();
    }

    const { error: insertError } = await supabaseAdmin.from("profiles").insert({ 
      id: authData.user.id,
      email: data.email,
      role_id: data.roleId || null,
      full_name: data.name,
      force_password_change: data.forcePasswordChange,
      prevent_password_change: data.preventPasswordChange,
      password_expires_at: expiresAt,
      user_type: data.userType,
      access_level: data.accessLevel,
      // Optional: you can still set default_property_id to the first one, or leave it as null
      default_property_id: data.propertyIds && data.propertyIds.length > 0 ? data.propertyIds[0] : null,
    });
    
    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to create profile: ${insertError.message}` };
    }

    if (data.propertyIds && data.propertyIds.length > 0) {
      const inserts = data.propertyIds.map(pid => ({ user_id: authData.user.id, property_id: pid }));
      await supabaseAdmin.from("personnel_properties").insert(inserts);
    }
  }
  
  revalidatePath("/admin/personnel");
  return { success: true, message: "User enrolled successfully!" };
}

export async function deletePersonnel(userId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Missing SUPABASE_SERVICE_ROLE_KEY to delete users." };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Prevent deleting super admins
  const { data: profile } = await supabaseAdmin.from("profiles").select("is_super_admin").eq("id", userId).single();
  if (profile?.is_super_admin) {
    return { error: "Cannot delete a Super Admin account." };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/personnel");
  return { success: true };
}

export async function resetUserPassword(userId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Missing SUPABASE_SERVICE_ROLE_KEY" };
  }
  
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const tempPassword = "TempPass123!";
  
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: tempPassword
  });
  
  if (authError) return { error: authError.message };
  
  const { error: profileError } = await supabaseAdmin.from("profiles").update({
    force_password_change: true
  }).eq("id", userId);
  
  if (profileError) return { error: profileError.message };
  
  return { success: true, tempPassword };
}
