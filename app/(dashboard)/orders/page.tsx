import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrdersTable } from "@/components/orders/orders-table";
import { getUserRole } from "@/lib/auth-helper";

export default async function OrdersPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch user role
  const userRole = await getUserRole(supabase, user.id);

  // Fetch stores for filter dropdown
  let stores;
  if (userRole === "admin") {
    const { data } = await supabase.from("stores").select("id, name").order("name");
    stores = data || [];
  } else {
    const { data } = await supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", user.id)
      .order("name");
    stores = data || [];
  }

  // Fetch orders based on role
  let ordersQuery;
  
  if (userRole === "admin") {
    ordersQuery = supabase
      .from("orders")
      .select("*, stores(name)")
      .order("created_at", { ascending: false });
  } else {
    ordersQuery = supabase
      .from("orders")
      .select("*, stores!inner(name, owner_id)")
      .eq("stores.owner_id", user.id)
      .order("created_at", { ascending: false });
  }

  const { data: orders, error } = await ordersQuery;

  if (error?.message) {
    return <div>Error loading orders: {error.message}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            View and manage customer orders
          </p>
        </div>
      </div>
      
      <OrdersTable orders={orders || []} stores={stores} />
    </div>
  );
}
