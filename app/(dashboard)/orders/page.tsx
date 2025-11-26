import { createClient } from "@/lib/supabase/server";
import { BadgeCheck, BadgeX, Clock, Package } from "lucide-react";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user role
  const { data: userData } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role;
  let ordersQuery = supabase.from("orders").select("*, stores(name)");

  // If owner, filter by their stores
  if (role === "owner") {
    // We can use the RLS policy which already filters, but being explicit is good too
    // However, since we have RLS "Owners can view store orders", a simple select should work if RLS is set up correctly.
    // But let's verify: The RLS says "exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())"
    // So yes, just selecting should return only their orders.
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
            Manage and track your store orders
          </p>
        </div>
      </div>
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Store
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {orders?.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {order.stores?.name || "Unknown Store"}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {order.customer_email}
                    </td>
                    <td className="p-4 align-middle font-semibold">
                      {order.currency} {order.total_price}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {order.status === "paid" && (
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                        )}
                        {order.status === "pending" && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        {order.status === "shipped" && (
                          <Package className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {orders?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
