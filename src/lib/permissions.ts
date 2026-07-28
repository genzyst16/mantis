import { SupabaseClient } from "@supabase/supabase-js";

export type UserPermissions = {
  is_super_admin: boolean;
  permissions: string[];
};

/**
 * Retrieves the full set of permissions for a given user.
 */
export async function getUserPermissions(supabase: SupabaseClient, userId: string): Promise<UserPermissions> {
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      is_super_admin,
      role_id,
      roles (
        role_permissions (
          permissions (
            permission_key
          )
        )
      )
    `)
    .eq("id", userId)
    .single();

  if (!profile) return { is_super_admin: false, permissions: [] };

  if (profile.is_super_admin) {
    return { is_super_admin: true, permissions: [] };
  }

  // Extract permission strings from the deeply nested join
  const permissions: string[] = [];
  const rolesData: any = profile.roles;
  
  if (rolesData) {
    const roleObj = Array.isArray(rolesData) ? rolesData[0] : rolesData;
    if (roleObj && roleObj.role_permissions) {
      for (const rp of roleObj.role_permissions) {
        if (rp.permissions && rp.permissions.permission_key) {
          permissions.push(rp.permissions.permission_key);
        }
      }
    }
  }

  return { is_super_admin: false, permissions };
}

/**
 * Helper to check if a user possesses a specific permission.
 * Super admins bypass all checks.
 */
export function hasPermission(userPerms: UserPermissions, requiredPermission: string): boolean {
  if (userPerms.is_super_admin) return true;
  return userPerms.permissions.includes(requiredPermission);
}
