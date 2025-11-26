import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin role
  const { data: userData } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/");
  }

  // Fetch all owners
  const { data: users } = await supabase
    .from("service_users")
    .select("*")
    .eq("role", "owner");

  // Fetch all stores
  const { data: stores } = await supabase
    .from("stores")
    .select("*");

  // Map to format expected by client component
  // We need to map Supabase user to the User interface expected by SettingsClient
  // Or update SettingsClient to accept Supabase types. 
  // For now, let's map it to keep Client component simple.
  
  const mappedUsers = users?.map((u: any) => ({
    id: u.id,
    name: u.email, // We don't have name in service_users yet, use email
    email: u.email,
    role: u.role
  })) || [];

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
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage website URLs for store owners
          </p>
        </div>
      </div>
      <SettingsClient users={mappedUsers as any} stores={mappedStores as any} />
    </div>
  );
}
