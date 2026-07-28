"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function updatePassword(userId: string, newPassword: string) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // 1. Update password in Supabase Auth
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (authError) return { error: authError.message };

  // 2. Clear force_password_change flag in profiles using Admin Client (bypasses RLS)
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ 
      force_password_change: false,
      // We don't automatically clear password_expires_at here because it depends on policies.
      // If we wanted a rotating password policy, we'd add X days to it here.
      // For MVP, we'll clear it so they aren't stuck in a loop.
      password_expires_at: null 
    })
    .eq("id", userId);
    
  if (profileError) return { error: profileError.message };
  
  redirect("/dashboard");
}
