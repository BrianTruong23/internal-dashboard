"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, User, Shield, Store } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  stores: any[];
  storeNames: string[];
  primaryStoreName: string | null;
}

interface StoreOption {
  id: string;
  name: string;
}

type SortField = "email" | "role" | "created_at" | "store_name";
type SortDirection = "asc" | "desc";

export function UsersTable({ users, stores }: { users: UserData[], stores: StoreOption[] }) {
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by store
    if (storeFilter !== "all") {
      filtered = filtered.filter(user => 
        user.storeNames?.includes(storeFilter) || 
        user.primaryStoreName === storeFilter
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === "store_name") {
        aVal = a.primaryStoreName || "";
        bVal = b.primaryStoreName || "";
      } else if (sortField === "created_at") {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      } else {
        aVal = (a[sortField as keyof UserData] || "").toString().toLowerCase();
        bVal = (b[sortField as keyof UserData] || "").toString().toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [users, storeFilter, roleFilter, sortField, sortDirection]);

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "owner":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "owner":
        return <Store className="h-4 w-4" />;
      case "client":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="store-filter" className="text-sm font-medium">Store:</label>
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

        <div className="flex items-center gap-2">
          <label htmlFor="role-filter" className="text-sm font-medium">Role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground ml-auto">
          Showing {filteredAndSortedUsers.length} of {users.length} users
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
                    onClick={() => toggleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      <SortIcon field="role" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("store_name")}
                  >
                    <div className="flex items-center">
                      Store
                      <SortIcon field="store_name" />
                    </div>
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Joined
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.email}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {user.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        {user.storeNames && user.storeNames.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {user.storeNames.map((name, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800">
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No store assigned</span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
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
