"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Order {
  id: string;
  customer_email: string;
  customer_name: string | null;
  total_price: number;
  currency: string;
  status: string;
  created_at: string;
  stores: { name: string } | null;
}

interface Store {
  id: string;
  name: string;
}

type SortField = "created_at" | "total_price" | "customer_name" | "status";
type SortDirection = "asc" | "desc";

export function OrdersTable({ orders, stores }: { orders: Order[], stores: Store[] }) {
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by store
    if (storeFilter !== "all") {
      filtered = filtered.filter(order => order.stores?.name === storeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "total_price") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === "customer_name") {
        aVal = (aVal || "").toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, storeFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="store-filter" className="text-sm font-medium">Filter by Store:</label>
          <select
            id="store-filter"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store.id} value={store.name}>{store.name}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("customer_name")}
                  >
                    <div className="flex items-center">
                      Customer
                      <SortIcon field="customer_name" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Store
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("total_price")}
                  >
                    <div className="flex items-center">
                      Amount
                      <SortIcon field="total_price" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredAndSortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer_name || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {order.stores?.name || "N/A"}
                      </td>
                      <td className="p-4 align-middle font-medium">
                        ${Number(order.total_price).toFixed(2)} {order.currency}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            order.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
