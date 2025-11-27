import { createClient } from "@/lib/supabase/server";
import { Overview } from "@/components/dashboard/overview";
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
  growthData
}: { 
  totalUsers: number, 
  totalStores: number, 
  avgStoresPerUser: string, 
  activeUsers: number,
  projectedRevenue: string,
  growthData: { name: string; users: number; stores: number; }[]
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Owners</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered store owners</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Stores</h3>
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">Active stores</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg Stores/Owner</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{avgStoresPerUser}</div>
            <p className="text-xs text-muted-foreground">Stores per owner</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active This Week</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Owners active recently</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{projectedRevenue}</div>
            <p className="text-xs text-muted-foreground">Lifetime platform revenue</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Platform Growth</h3>
            <p className="text-sm text-muted-foreground">
              New owners and stores registration over time
            </p>
          </div>
          <div className="p-6 pt-0">
            <Overview data={growthData} />
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
  const { data: userData, error: userError } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("Dashboard Debug:");
  console.log("User ID:", user.id);
  console.log("User Data:", userData);
  console.log("User Error:", userError);

  const userRole = userData?.role || "owner";
  console.log("Determined Role:", userRole);

  if (userRole === "admin") {
    // Fetch Owners
    const { data: owners } = await supabase
      .from("service_users")
      .select("created_at")
      .eq("role", "owner")
      .order("created_at", { ascending: true });
      
    // Fetch Stores
    const { data: stores } = await supabase
      .from("stores")
      .select("created_at")
      .order("created_at", { ascending: true });

    const totalUsers = owners?.length || 0;
    const totalStores = stores?.length || 0;
    
    // Calculate avg stores per user
    const avgStores = totalUsers && totalStores ? (totalStores / totalUsers).toFixed(1) : "0";

    // Calculate Total Revenue from orders
    const { data: orders } = await supabase.from("orders").select("total_price");
    const totalRevenue = orders?.reduce((acc, order) => acc + (Number(order.total_price) || 0), 0) || 0;
    
    // Process data for chart (Cumulative Growth)
    const dateMap = new Map<string, { users: number; stores: number }>();
    
    // Helper to add to map
    const addToMap = (dateStr: string, type: 'users' | 'stores') => {
      const date = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const current = dateMap.get(date) || { users: 0, stores: 0 };
      if (type === 'users') current.users++;
      else current.stores++;
      dateMap.set(date, current);
    };

    owners?.forEach(o => addToMap(o.created_at, 'users'));
    stores?.forEach(s => addToMap(s.created_at, 'stores'));

    // Convert map to array and sort by date
    // Note: The map keys are formatted strings like "Nov 26", which don't sort chronologically easily if spanning years.
    // For a robust solution, we should use timestamps for sorting.
    // Let's re-process using timestamps for sorting, then format.
    
    const events: { date: number; type: 'user' | 'store' }[] = [];
    owners?.forEach(o => events.push({ date: new Date(o.created_at).getTime(), type: 'user' }));
    stores?.forEach(s => events.push({ date: new Date(s.created_at).getTime(), type: 'store' }));
    
    events.sort((a, b) => a.date - b.date);
    
    let cumulativeUsers = 0;
    let cumulativeStores = 0;
    const growthData: { name: string; users: number; stores: number }[] = [];
    
    // Group by day to avoid too many points
    const groupedEvents = new Map<string, { users: number; stores: number }>();
    
    events.forEach(event => {
      if (event.type === 'user') cumulativeUsers++;
      else cumulativeStores++;
      
      const dateKey = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      groupedEvents.set(dateKey, { users: cumulativeUsers, stores: cumulativeStores });
    });
    
    groupedEvents.forEach((val, key) => {
      growthData.push({ name: key, users: val.users, stores: val.stores });
    });

    // If no data, provide at least one point
    if (growthData.length === 0) {
      growthData.push({ name: 'Today', users: 0, stores: 0 });
    }
    
    return <AdminOverview 
      totalUsers={totalUsers} 
      totalStores={totalStores} 
      avgStoresPerUser={avgStores}
      activeUsers={Math.floor(totalUsers * 0.8)} // Mock active rate
      projectedRevenue={`$${totalRevenue.toFixed(2)}`}
      growthData={growthData}
    />;
  }

  return <StoreOwnerOverviewPage />;
}
