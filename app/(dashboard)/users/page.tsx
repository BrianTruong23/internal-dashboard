import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/users/users-table";

export default async function UsersPage() {
  const supabase = await createClient();
  
  // Check auth and role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUserData } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = currentUserData?.role;

  // Admins and owners can access this page
  if (userRole !== "admin" && userRole !== "owner") {
    redirect("/");
  }

  let users;
  let error;
  let storesList;

  if (userRole === "admin") {
    // Fetch all stores for filter
    const { data: allStores } = await supabase
      .from("stores")
      .select("id, name")
      .order("name");
    storesList = allStores || [];

    // Admins see ALL users
    const result = await supabase
      .from("service_users")
      .select(`
        *,
        stores!store_id (
          name
        )
      `);
    users = result.data;
    error = result.error;
  } else {
    // Owners see only CLIENTS associated with their stores
    console.log("=== USERS PAGE DEBUG (OWNER) ===");
    console.log("1. Current owner_id (user.id):", user.id);
    console.log("   Owner email:", user.email);
    
    // First get owner's store IDs
    const { data: ownerStores, error: storesError } = await supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", user.id);

    console.log("2. Stores owned by this user:");
    console.log("   Query: SELECT id, name FROM stores WHERE owner_id =", user.id);
    console.log("   Result:", ownerStores);
    console.log("   Error:", storesError);

    // Set stores list for filter
    storesList = ownerStores || [];

    const storeIds = ownerStores?.map(s => s.id) || [];
    console.log("3. Extracted store_ids:", storeIds);

    if (storeIds.length === 0) {
      console.log("4. No stores found for this owner. Returning empty users.");
      // No stores for this owner, return empty users
      users = [];
      error = null;
    } else {
      console.log("4. Querying service_users for clients with these store_ids...");
      console.log("   Query: SELECT * FROM service_users WHERE role='client' AND store_id IN", storeIds);
      
      // Then get clients for those stores
      const result = await supabase
        .from("service_users")
        .select(`
          *,
          stores!store_id (
            name
          )
        `)
        .eq("role", "client")
        .in("store_id", storeIds);
      
      console.log("5. Client users result:");
      console.log("   Data:", result.data);
      console.log("   Error:", result.error);
      console.log("   Count:", result.data?.length || 0);
      
      users = result.data;
      error = result.error;
    }
    console.log("=== END DEBUG ===");
  }

  console.log("Final users:", users);
  console.log("Final error:", error);

  if (error?.message) {
    console.error("Error fetching users:", error);
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {userRole === "admin" ? "All Users" : "My Clients"}
          </h2>
          <p className="text-muted-foreground">
            {userRole === "admin" ? "Manage all users and their roles" : "View clients linked to your stores"}
          </p>
        </div>
      </div>
      
      <UsersTable users={users || []} stores={storesList || []} />
    </div>
  );
}
