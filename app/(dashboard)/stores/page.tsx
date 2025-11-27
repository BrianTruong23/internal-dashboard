import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoresTable } from "@/components/stores/stores-table";

export default async function StoresPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = userData?.role || "owner";

  // Only admins should see this page (or owners see their own stores)
  // For now, let's assume this is the Admin Stores page as per request
  if (userRole !== "admin") {
    // If owner, maybe redirect to their dashboard or show only their stores?
    // The prompt implies this is for "Admin Stores Page"
    // But let's be safe and allow owners to see their own stores if they land here
  }

  // Fetch stores with owner details and stats
  let query = supabase
    .from("stores")
    .select(`
      *,
      owner:service_users!owner_id(
        owners(email)
      ),
      stats:store_stats(total_revenue, total_orders)
    `)
    .order("created_at", { ascending: false });

  // If not admin, filter by owner_id
  if (userRole !== "admin") {
    query = query.eq("owner_id", user.id);
  }

  const { data: stores, error } = await query;

  if (error) {
    console.error("Error fetching stores:", error);
    return <div>Error loading stores: {error.message}</div>;
  }

  // Transform data to match StoresTable interface
  const formattedStores = stores?.map((store: any) => {
    // Extract email from the nested owners object/array
    // owner is service_users, which has owners relation
    // owners might be an array or object depending on Supabase detection of 1:1
    const ownerData = store.owner?.owners;
    const email = Array.isArray(ownerData) ? ownerData[0]?.email : ownerData?.email;

    return {
      ...store,
      owner: { email }, // Flatten structure for the table
      stats: Array.isArray(store.stats) ? store.stats[0] : store.stats
    };
  }) || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stores</h2>
          <p className="text-muted-foreground">
            Manage and monitor all registered stores
          </p>
        </div>
      </div>
      
      <StoresTable stores={formattedStores} />
    </div>
  );
}
