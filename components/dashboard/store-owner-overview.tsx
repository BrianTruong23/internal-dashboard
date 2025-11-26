import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

export default function StoreOwnerOverviewPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Store Overview</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">$12,845.32</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Orders</h3>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">352</div>
            <p className="text-xs text-muted-foreground">+24 from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Products Sold</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">1,428</div>
            <p className="text-xs text-muted-foreground">+112 from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Conversion Rate</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Wireless Headphones</p>
                  <p className="text-xs text-muted-foreground">Electronics</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">156 sold</p>
                  <p className="text-xs text-muted-foreground">$4,680.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Smart Watch</p>
                  <p className="text-xs text-muted-foreground">Electronics</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">98 sold</p>
                  <p className="text-xs text-muted-foreground">$2,940.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Laptop Stand</p>
                  <p className="text-xs text-muted-foreground">Accessories</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">87 sold</p>
                  <p className="text-xs text-muted-foreground">$1,305.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New order #3845</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Product review received</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Inventory updated</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Order #3820 shipped</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
