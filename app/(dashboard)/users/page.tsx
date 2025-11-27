import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/users/users-table";
import { getUserRole } from "@/lib/auth-helper";

export default async function UsersPage() {
  const supabase = await createClient();

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Role
  const userRole = await getUserRole(supabase, user.id);

  // Only admins and owners can access this page
  if (userRole !== "admin" && userRole !== "owner") {
    redirect("/");
  }

  let users: any[] | undefined;
  let error: any = null;
  let storesList: any[] = [];

  if (userRole === "admin") {
    // ============================
    // ADMIN PATH
    // ============================

    // 1. Fetch all stores (for filters / UI)
    {
      const { data: allStores, error: storesError } = await supabase
        .from("stores")
        .select("id, name")
        .order("name");

      if (storesError) {
        console.error("Error fetching stores for admin:", storesError);
      }

      storesList = allStores || [];
    }

    // 2. Fetch base service_users with owners/clients joins
    const {
      data: serviceUsers,
      error: serviceUsersError,
    } = await supabase
      .from("service_users")
      .select(
        `
        id,
        role,
        created_at,
        owners (
          email,
          name
        ),
        clients (
          email,
          name,
          store_id
        )
      `
      )
      .order("created_at", { ascending: false });

    // 3. Fetch admins list to tag admins
    const { data: adminsList, error: adminsError } = await supabase
      .from("admins")
      .select("id");

    if (adminsError) {
      console.error("Error fetching admins list:", adminsError);
    }

    const adminIds = new Set((adminsList || []).map((a) => a.id));

    // 4. Merge and determine correct role per user
    users =
      serviceUsers?.map((u: any) => {
        let realRole = u.role;

        if (adminIds.has(u.id)) {
          realRole = "admin";
        } else if (u.owners) {
          realRole = "owner";
        } else if (u.clients) {
          realRole = "client";
        }

        const details = u.owners || u.clients || {};

        return {
          id: u.id,
          email: details.email || "No Email",
          name: details.name || "No Name",
          role: realRole,
          created_at: u.created_at,
          // you can later wire this up if you want per-user stores
          stores: [],
        };
      }) || [];

    error = serviceUsersError;
  } else {
    // ============================
    // OWNER PATH
    // ============================
    console.log("=== USERS PAGE DEBUG (OWNER) ===");

    // 1. Get stores owned by this user
    const { data: ownerStores, error: ownerStoresError } = await supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", user.id);

    if (ownerStoresError) {
      console.error("Error fetching owner stores:", ownerStoresError);
    }

    storesList = ownerStores || [];
    const storeIds = (ownerStores || []).map((s) => s.id);

    if (storeIds.length === 0) {
      // No stores = no clients
      users = [];
      error = null;
    } else {
      // 2. Get clients whose store_id is in the owner's stores
      const {
        data: clientsData,
        error: clientsError,
      } = await supabase
        .from("clients")
        .select(
          `
          id,
          email,
          name,
          store_id,
          created_at
        `
        )
        .in("store_id", storeIds);

      if (clientsError) {
        console.error("Error fetching clients for owner:", clientsError);
      }

      users =
        clientsData?.map((c: any) => ({
          id: c.id,
          email: c.email,
          name: c.name,
          role: "client",
          created_at: c.created_at,
          store_id: c.store_id,
          stores: [], // can be enriched on the UI using storesList if needed
        })) || [];

      error = clientsError;
    }
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
            {userRole === "admin"
              ? "Manage all users and their roles"
              : "View clients linked to your stores"}
          </p>
        </div>
      </div>

      <UsersTable users={users || []} stores={storesList || []} />
    </div>
  );
}
