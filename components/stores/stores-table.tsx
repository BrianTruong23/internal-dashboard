"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Store, Calendar, DollarSign, ShoppingCart, User } from "lucide-react";
import Link from "next/link";

interface StoreData {
  id: string;
  name: string;
  url: string | null;
  category: string | null;
  created_at: string;
  last_active: string | null;
  owner: {
    email: string;
  } | null;
  stats: {
    total_revenue: number;
    total_orders: number;
  } | null;
}

type SortField = "name" | "owner" | "created_at" | "last_active" | "revenue" | "orders";
type SortDirection = "asc" | "desc";

export function StoresTable({ stores }: { stores: StoreData[] }) {
  const [filter, setFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(stores.map(s => s.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [stores]);

  // Filter and sort stores
  const filteredAndSortedStores = useMemo(() => {
    let result = [...stores];

    // Filter by name or owner email
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(store => 
        store.name.toLowerCase().includes(lowerFilter) || 
        store.owner?.email.toLowerCase().includes(lowerFilter)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter(store => store.category === categoryFilter);
    }

    // Filter by status (Active = last_active within 30 days)
    if (statusFilter !== "all") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      result = result.filter(store => {
        const lastActiveDate = store.last_active ? new Date(store.last_active) : new Date(store.created_at);
        const isActive = lastActiveDate >= thirtyDaysAgo;
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "owner":
          aVal = a.owner?.email.toLowerCase() || "";
          bVal = b.owner?.email.toLowerCase() || "";
          break;
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case "last_active":
          aVal = a.last_active ? new Date(a.last_active).getTime() : 0;
          bVal = b.last_active ? new Date(b.last_active).getTime() : 0;
          break;
        case "revenue":
          aVal = Number(a.stats?.total_revenue || 0);
          bVal = Number(b.stats?.total_revenue || 0);
          break;
        case "orders":
          aVal = Number(a.stats?.total_orders || 0);
          bVal = Number(b.stats?.total_orders || 0);
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [stores, filter, categoryFilter, statusFilter, sortField, sortDirection]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative max-w-sm w-full md:w-64">
          <input
            type="text"
            placeholder="Search stores or owners..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-sm font-medium">Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active (30d)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground ml-auto">
          Showing {filteredAndSortedStores.length} of {stores.length} stores
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center">
                      Store Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("owner")}
                  >
                    <div className="flex items-center">
                      Owner
                      <SortIcon field="owner" />
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    URL
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("orders")}
                  >
                    <div className="flex items-center">
                      Orders
                      <SortIcon field="orders" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("revenue")}
                  >
                    <div className="flex items-center">
                      Revenue
                      <SortIcon field="revenue" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("last_active")}
                  >
                    <div className="flex items-center">
                      Last Active
                      <SortIcon field="last_active" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredAndSortedStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No stores found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStores.map((store) => (
                    <tr
                      key={store.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
                            <Store className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{store.name}</span>
                            {store.category && (
                              <span className="text-xs text-muted-foreground capitalize">{store.category}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{store.owner?.email || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {store.url ? (
                          <a 
                            href={store.url.startsWith('http') ? store.url : `https://${store.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No URL</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                          <span>{store.stats?.total_orders || 0}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-1 font-medium text-green-700">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(Number(store.stats?.total_revenue || 0))}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {store.last_active 
                              ? new Date(store.last_active).toLocaleDateString() 
                              : new Date(store.created_at).toLocaleDateString()}
                          </span>
                        </div>
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
