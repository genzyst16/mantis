import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testEnroll() {
  const { data: roleData } = await supabaseAdmin.from("roles").select("id").limit(1);
  const roleId = roleData?.[0]?.id;

  console.log("Role ID:", roleId);

  const email = "test_enroll_42@example.com";
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: "TempPass123!",
    email_confirm: true,
    user_metadata: { full_name: "Test User 42" }
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  
  console.log("Auth user created:", authData.user.id);

  const { error: insertError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    email: email,
    role_id: roleId,
    full_name: "Test User 42",
    force_password_change: true,
    prevent_password_change: false,
    password_expires_at: null
  });

  if (insertError) {
    console.error("Insert Error:", insertError);
  } else {
    console.log("Profile created successfully");
  }
}

testEnroll();
