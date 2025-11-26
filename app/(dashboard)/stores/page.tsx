import { Store, ExternalLink, Activity } from "lucide-react";

const stores = [
  {
    id: "1",
    name: "Fashion Boutique",
    owner: "Admin User",
    url: "https://fashionboutique.com",
    category: "Fashion",
    status: "Active",
    orders: 145,
    revenue: "$12,450",
  },
  {
    id: "2",
    name: "Tech Gadgets Store",
    owner: "Admin User",
    url: "https://techgadgets.com",
    category: "Electronics",
    status: "Active",
    orders: 298,
    revenue: "$45,890",
  },
  {
    id: "3",
    name: "Organic Foods Market",
    owner: "John Merchant",
    url: "https://organicfoods.com",
    category: "Food & Beverage",
    status: "Active",
    orders: 187,
    revenue: "$23,670",
  },
  {
    id: "4",
    name: "Beauty & Wellness",
    owner: "Sarah Johnson",
    url: "https://beautywellness.com",
    category: "Beauty",
    status: "Active",
    orders: 234,
    revenue: "$31,240",
  },
  {
    id: "5",
    name: "Home Decor Shop",
    owner: "Sarah Johnson",
    url: "https://homedecor.com",
    category: "Home & Living",
    status: "Active",
    orders: 156,
    revenue: "$18,920",
  },
];

export default function StoresPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Stores</h2>
          <p className="text-muted-foreground">
            Manage all registered stores on the platform
          </p>
        </div>
      </div>
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Store
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Owner
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    URL
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Orders
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {stores.map((store) => (
                  <tr
                    key={store.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Store className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{store.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {store.owner}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary">
                        {store.category}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <a
                        href={store.url}
                        target="_blank"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-xs">{store.url.replace('https://', '')}</span>
                      </a>
                    </td>
                    <td className="p-4 align-middle font-semibold">
                      {store.orders}
                    </td>
                    <td className="p-4 align-middle font-semibold text-green-600">
                      {store.revenue}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {store.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
