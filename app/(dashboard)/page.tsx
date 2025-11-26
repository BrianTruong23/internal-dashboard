import { createClient } from "@/lib/supabase/server";
import { StoreStatsChart } from "@/components/dashboard/store-stats-chart";
import { Users, Store, TrendingUp, Activity, DollarSign } from "lucide-react";
import StoreOwnerOverviewPage from "@/components/dashboard/store-owner-overview";
import { redirect } from "next/navigation";

// Admin Overview Component
function AdminOverview({ 
  totalUsers, 
  totalStores, 
  avgStoresPerUser, 
  activeUsers,
  projectedRevenue,
  statsData
}: { 
  totalUsers: number, 
  totalStores: number, 
  avgStoresPerUser: string, 
  activeUsers: number,
  projectedRevenue: string,
  statsData: { date: string; revenue: number; products_sold: number; total_orders: number; }[]
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Stores</h3>
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">+24% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg Stores/User</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{avgStoresPerUser}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active This Week</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">86% activity rate</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Projected Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{projectedRevenue}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Store Performance Trends</h3>
            <p className="text-sm text-muted-foreground">
              Track revenue, products sold, and total orders over time
            </p>
          </div>
          <div className="p-6 pt-0">
            <StoreStatsChart data={statsData} />
          </div>
        </div>
        {/* The following div was misplaced, it should be part of the grid or a new grid row */}
        {/* Assuming it should be in the same grid row, but with different col-span or a new grid */}
        {/* For now, placing it in a new grid row to fix the immediate JSX structure issue */}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* New grid row for Recent Registrations */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Recent Registrations</h3>
            <p className="text-sm text-muted-foreground">
              Latest users joined this week
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-8">
              {/* Mock data for now, could be fetched too */}
              <div className="flex items-center">
                <div className="ml-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">sarah.j@example.com</p>
                </div>
                <div className="ml-auto font-medium text-sm">2 stores</div>
              </div>
              <div className="flex items-center">
                <div className="ml-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Mike Chen</p>
                  <p className="text-sm text-muted-foreground">mike.c@example.com</p>
                </div>
                <div className="ml-auto font-medium text-sm">1 store</div>
              </div>
              <div className="flex items-center">
                <div className="ml-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Emily Davis</p>
                  <p className="text-sm text-muted-foreground">emily.d@example.com</p>
                </div>
                <div className="ml-auto font-medium text-sm">3 stores</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
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

  if (userRole === "admin") {
    // Fetch Admin Stats
    const { count: totalUsers } = await supabase.from("service_users").select("*", { count: "exact", head: true });
    const { count: totalStores } = await supabase.from("stores").select("*", { count: "exact", head: true });
    
    // Calculate avg stores per user
    const avgStores = totalUsers && totalStores ? (totalStores / totalUsers).toFixed(1) : "0";

    // Mocking active users and revenue for now as we don't have full order data yet
    // In a real scenario, we would sum up order totals
    const { data: orders } = await supabase.from("orders").select("total_price");
    const totalRevenue = orders?.reduce((acc, order) => acc + (Number(order.total_price) || 0), 0) || 0;
    
    // Fetch store stats (last 30 days, aggregated across all stores)
    const { data: statsData } = await supabase
      .from("store_stats")
      .select("date, total_revenue, total_orders, total_products_sold")
      .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order("date");
    
    // Aggregate stats by date (sum across all stores)
    const aggregatedStats: { [key: string]: { total_revenue: number; total_products_sold: number; total_orders: number } } = {};
    statsData?.forEach((stat: any) => {
      const dateKey = new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!aggregatedStats[dateKey]) {
        aggregatedStats[dateKey] = { total_revenue: 0, total_products_sold: 0, total_orders: 0 };
      }
      aggregatedStats[dateKey].total_revenue += Number(stat.total_revenue) || 0;
      aggregatedStats[dateKey].total_products_sold += stat.total_products_sold || 0;
      aggregatedStats[dateKey].total_orders += stat.total_orders || 0;
    });
    
    const formattedStats = Object.entries(aggregatedStats).map(([date, data]) => ({
      date,
      revenue: data.total_revenue,
      products_sold: data.total_products_sold,
      total_orders: data.total_orders,
    }));
    
    return <AdminOverview 
      totalUsers={totalUsers || 0} 
      totalStores={totalStores || 0} 
      avgStoresPerUser={avgStores}
      activeUsers={Math.floor((totalUsers || 0) * 0.8)} // Mock active rate
      projectedRevenue={`$${totalRevenue.toFixed(2)}`}
      statsData={formattedStats}
    />;
  }

  return <StoreOwnerOverviewPage />;
}
