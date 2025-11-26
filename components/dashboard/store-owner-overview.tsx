import { createClient } from "@/lib/supabase/server";
import { DollarSign, ShoppingCart, Package } from "lucide-react";
import { StoreStatsChart } from "@/components/dashboard/store-stats-chart";

export default async function StoreOwnerOverviewPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  console.log("=== STORE OWNER OVERVIEW DEBUG ===");
  console.log("Current User ID:", user.id);
  console.log("Current User Email:", user.email);

  // First, fetch the stores owned by this user
  const { data: ownedStores, error: storesError } = await supabase
    .from("stores")
    .select("id, name, owner_id")
    .eq("owner_id", user.id);

  console.log("Owned Stores:", ownedStores);
  console.log("Stores Error:", storesError);

  if (!ownedStores || ownedStores.length === 0) {
    console.log("No stores found for this owner");
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Store Owner Dashboard</h2>
        </div>
        <p className="text-muted-foreground">No stores found. Please contact admin to assign a store.</p>
      </div>
    );
  }

  // Get store IDs
  const storeIds = ownedStores.map(store => store.id);
  console.log("Store IDs:", storeIds);

  // Fetch store stats for these store IDs (aggregated for cards)
  const { data: stats, error: statsError } = await supabase
    .from("store_stats")
    .select("total_revenue, total_orders, total_products_sold, store_id")
    .in("store_id", storeIds);

  console.log("Stats Data:", stats);
  console.log("Stats Error:", statsError);

  // Fetch store stats for chart using updated_at as date
  const { data: chartStats } = await supabase
    .from("store_stats")
    .select("updated_at, total_revenue, total_orders, total_products_sold")
    .in("store_id", storeIds)
    .order("updated_at");

  // Format for chart - use updated_at date
  const formattedChartData = chartStats?.map((stat: any) => ({
    date: new Date(stat.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(stat.total_revenue) || 0,
    products_sold: stat.total_products_sold || 0,
    total_orders: stat.total_orders || 0,
  })) || [];

  console.log("Chart Data:", formattedChartData);
  console.log("=== END DEBUG ===");

  // Aggregate stats for cards
  const totalRevenue = stats?.reduce((sum, stat) => sum + (Number(stat.total_revenue) || 0), 0) || 0;
  const totalOrders = stats?.reduce((sum, stat) => sum + (stat.total_orders || 0), 0) || 0;
  const totalProductsSold = stats?.reduce((sum, stat) => sum + (stat.total_products_sold || 0), 0) || 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Store Owner Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Orders</h3>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Products Sold</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalProductsSold}</div>
            <p className="text-xs text-muted-foreground">Total items sold</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Store Performance</h3>
            <p className="text-sm text-muted-foreground">
              Track your store's metrics over time
            </p>
          </div>
          <div className="p-6 pt-0">
            <StoreStatsChart data={formattedChartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
