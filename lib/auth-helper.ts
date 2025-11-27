import { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "admin" | "owner" | "client" | null;

export async function getUserRole(supabase: SupabaseClient, userId: string): Promise<UserRole> {
  try {
    // 1. Check 'admins' table
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .single();

    if (adminData && !adminError) {
      return "admin";
    }

    // 2. Check 'owners' table
    const { data: ownerData, error: ownerError } = await supabase
      .from("owners")
      .select("id")
      .eq("id", userId)
      .single();

    if (ownerData && !ownerError) {
      return "owner";
    }

    // 3. Fallback: Check 'service_users' role column (Legacy/Base)
    const { data: userData, error: userError } = await supabase
      .from("service_users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userData && !userError) {
      return userData.role as UserRole;
    }

    return null;
  } catch (error) {
    console.error("Error determining user role:", error);
    return null;
  }
}
