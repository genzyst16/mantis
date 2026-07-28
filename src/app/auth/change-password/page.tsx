import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if they are explicitly prevented from changing password
  const { data: profile } = await supabase
    .from("profiles")
    .select("prevent_password_change, force_password_change, password_expires_at")
    .eq("id", user.id)
    .single();

  if (profile?.prevent_password_change) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-950 p-8 rounded-xl shadow-lg text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Password Change Disabled</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your account is configured to prevent manual password changes. Please contact your system administrator.
          </p>
          <form action="/auth/signout" method="post">
            <button className="text-emerald-600 hover:underline">Sign Out</button>
          </form>
        </div>
      </div>
    );
  }

  const isExpired = profile?.password_expires_at && new Date(profile.password_expires_at) < new Date();
  const isForced = profile?.force_password_change || isExpired;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 p-8 rounded-xl shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Update Password</h2>
          {isForced ? (
            <p className="text-red-500 text-sm">
              You must change your password before continuing.
            </p>
          ) : (
            <p className="text-slate-500 text-sm">
              Please enter your new password below.
            </p>
          )}
        </div>
        
        <ChangePasswordForm userId={user.id} />
        
        <div className="mt-6 text-center">
          <form action="/auth/signout" method="post">
            <button className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
