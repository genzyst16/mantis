import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/login";
  
  return NextResponse.redirect(redirectUrl, {
    status: 302,
  });
}
