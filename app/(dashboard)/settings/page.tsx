import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { getUserRole } from "@/lib/auth-helper";

export default async function SettingsPage() {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin role
  const userRole = await getUserRole(supabase, user.id);

  if (userRole !== "admin") {
    redirect("/");
  }

  // Fetch all owners
  const { data: users } = await supabase
    .from("service_users")
    .select(`
      *,
      owners (
        email,
        name
      )
    `)
    .eq("role", "owner");

  // Fetch all stores
  const { data: stores } = await supabase
    .from("stores")
    .select("*");

  // Map to format expected by client component
  const mappedUsers = users?.map((u: any) => {
    const ownerDetails = u.owners || {};
    return {
      id: u.id,
      name: ownerDetails.name || ownerDetails.email || "Unknown",
      email: ownerDetails.email || "",
      role: u.role
    };
  }) || [];

  const mappedStores = stores?.map((s: any) => ({
    id: s.id,
    userId: s.owner_id,
    name: s.name,
    url: s.url,
    products: 0, // Mock
    revenue: 0, // Mock
    status: "active"
  })) || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assign Stores</h2>
          <p className="text-muted-foreground">
            Manage website URLs and assign stores to owners
          </p>
        </div>
      </div>
      <SettingsClient users={mappedUsers as any} stores={mappedStores as any} />
    </div>
  );
}
