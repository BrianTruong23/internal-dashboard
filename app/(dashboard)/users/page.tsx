/* app/(dashboard)/users/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */

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

    // 1. Fetch base users + role
    const {
      data: serviceUsers,
      error: serviceUsersError,
    } = await supabase
      .from("service_users")
      .select("id, role, created_at")
      .order("created_at", { ascending: false });

    console.log("ADMIN: serviceUsers =", serviceUsers);

    if (serviceUsersError) {
      console.error("Error fetching service_users:", serviceUsersError);
      error = serviceUsersError;
    }

    // 2. Fetch admins, owners, clients (with store), stores in parallel
    const [adminsRes, ownersRes, clientsRes, storesRes] = await Promise.all([
      supabase.from("admins").select("id, email, name"),
      supabase.from("owners").select("id, email, name"),
      supabase
        .from("clients")
        .select(
          `
          id,
          email,
          name,
          store_id,
          created_at,
          store:stores (
            id,
            name,
            owner_id
          )
        `
        ),
      supabase.from("stores").select("id, name, owner_id").order("name"),
    ]);

    const admins = adminsRes.data || [];
    const owners = ownersRes.data || [];
    const clients = clientsRes.data || [];
    const stores = storesRes.data || [];

    console.log("ADMIN: admins =", admins);
    console.log("ADMIN: owners =", owners);
    console.log("ADMIN: clients (with store) =", clients);
    console.log("ADMIN: stores =", stores);

    if (adminsRes.error) console.error("Error fetching admins:", adminsRes.error);
    if (ownersRes.error) console.error("Error fetching owners:", ownersRes.error);
    if (clientsRes.error) console.error("Error fetching clients:", clientsRes.error);
    if (storesRes.error) console.error("Error fetching stores:", storesRes.error);

    storesList = stores; // for filters / UI

    // 3. Build lookup maps
    const adminsById: Record<string, any> = {};
    admins.forEach((a) => {
      adminsById[a.id] = a;
    });

    const ownersById: Record<string, any> = {};
    owners.forEach((o) => {
      ownersById[o.id] = o;
    });

    const clientsById: Record<string, any> = {};
    clients.forEach((c) => {
      clientsById[c.id] = c;
    });

    const storesById: Record<string, any> = {};
    stores.forEach((s) => {
      storesById[s.id] = s;
    });

    const storesByOwnerId: Record<string, any[]> = {};
    stores.forEach((s) => {
      if (!storesByOwnerId[s.owner_id]) {
        storesByOwnerId[s.owner_id] = [];
      }
      storesByOwnerId[s.owner_id].push(s);
    });

    console.log("ADMIN: storesByOwnerId =", storesByOwnerId);

    // 4. Merge data per service_user
    users =
      serviceUsers?.map((u: any) => {
        const admin = adminsById[u.id];
        const owner = ownersById[u.id];
        const client = clientsById[u.id];

        let role: string = u.role;
        let email: string | null = null;
        let name: string | null = null;
        let userStores: any[] = [];

        if (admin) {
          role = "admin";
          email = admin.email;
          name = admin.name;
        } else if (owner) {
          role = "owner";
          email = owner.email;
          name = owner.name;
          userStores = storesByOwnerId[u.id] || [];
        } else if (client) {
          role = "client";
          email = client.email;
          name = client.name;

          const clientStore =
            (client as any).store ||
            (client.store_id ? storesById[client.store_id] : null);

          if (clientStore) {
            userStores = [clientStore];
          }
        }

        const storeNames = (userStores || [])
          .map((s: any) => s?.name)
          .filter(Boolean);
        const primaryStoreName = storeNames[0] ?? null;

        const mergedUser = {
          id: u.id,
          email: email || "No Email",
          name: name || "No Name",
          role,
          created_at: u.created_at,
          stores: userStores,          // full objects (id, name, owner_id)
          storeNames,                  // ["Store A", "Store B", ...]
          primaryStoreName,            // "Store A"
        };

        console.log("ADMIN: merged user =", mergedUser);

        return mergedUser;
      }) || [];

    // propagate any base error
    error =
      error ||
      serviceUsersError ||
      adminsRes.error ||
      ownersRes.error ||
      clientsRes.error ||
      storesRes.error;
  } else {
    // ============================
    // OWNER PATH
    // ============================
    console.log("=== USERS PAGE DEBUG (OWNER) ===");

    // 1. Get stores owned by this user
    const { data: ownerStores, error: ownerStoresError } = await supabase
      .from("stores")
      .select("id, name, owner_id")
      .eq("owner_id", user.id);

    console.log("OWNER: ownerStores =", ownerStores);

    if (ownerStoresError) {
      console.error("Error fetching owner stores:", ownerStoresError);
    }

    storesList = ownerStores || [];
    const storeIds = (ownerStores || []).map((s) => s.id);

    if (storeIds.length === 0) {
      // No stores = no clients
      users = [];
      error = ownerStoresError ?? null;
    } else {
      // Build a map of store_id -> store object for quick lookup
      const storeMap: Record<string, any> = {};
      (ownerStores || []).forEach((s) => {
        storeMap[s.id] = s;
      });

      console.log("OWNER: storeMap =", storeMap);

      // 2. Get clients whose store_id is in the owner's stores
      const {
        data: clientsData,
        error: clientsError,
      } = await supabase
        .from("clients")
        .select("id, email, name, store_id, created_at")
        .in("store_id", storeIds);

      console.log("OWNER: clientsData =", clientsData);

      if (clientsError) {
        console.error("Error fetching clients for owner:", clientsError);
      }

      users =
        clientsData?.map((c: any) => {
          const store = c.store_id ? storeMap[c.store_id] : null;
          const userStores = store ? [store] : [];

          const storeNames = (userStores || [])
            .map((s: any) => s?.name)
            .filter(Boolean);
          const primaryStoreName = storeNames[0] ?? null;

          const mergedUser = {
            id: c.id,
            email: c.email || "No Email",
            name: c.name || "No Name",
            role: "client",
            created_at: c.created_at,
            store_id: c.store_id,
            stores: userStores,
            storeNames,
            primaryStoreName,
          };

          console.log("OWNER: merged user =", mergedUser);

          return mergedUser;
        }) || [];

      error = clientsError || ownerStoresError || null;
    }
  }

  console.log("Final users array:", users);
  console.log("Final error object:", error);

  if (error?.message) {
    console.error("Error loading users:", error);
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

      {/* UsersTable can now use user.storeNames or user.primaryStoreName to display stores */}
      <UsersTable users={users || []} stores={storesList || []} />
    </div>
  );
}
