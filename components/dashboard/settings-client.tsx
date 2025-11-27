"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, Save, Globe } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Store {
  id: string;
  name: string;
  userId: string;
  url?: string;
}

interface SettingsClientProps {
  users: User[];
  stores: Store[];
}

export function SettingsClient({ users, stores }: SettingsClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  // Initialize URLs from existing stores
  useState(() => {
    const initialUrls: Record<string, string> = {};
    users.forEach(user => {
      const userStore = stores.find(s => s.userId === user.id);
      if (userStore?.url) {
        initialUrls[user.id] = userStore.url;
      }
    });
    setUrls(initialUrls);
  });

  const handleUrlChange = (userId: string, value: string) => {
    setUrls(prev => ({ ...prev, [userId]: value }));
  };

  const handleSave = async (userId: string) => {
    const url = urls[userId];
    if (!url) return;

    setLoadingId(userId);
    try {
      const response = await fetch("/api/admin/assign-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      router.refresh();
      alert("Website URL saved successfully!");
    } catch (error) {
      console.error("Failed to save website:", error);
      alert("Failed to save website. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssignStore = async (userId: string, storeId: string) => {
    if (!storeId) return;
    
    // Find user details
    const user = users.find(u => u.id === userId);

    setLoadingId(userId);
    try {
      const response = await fetch("/api/admin/assign-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          storeId,
          userName: user?.name,
          userEmail: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign store");
      }

      router.refresh();
      // Clear selection or show success?
      alert("Store assigned successfully!");
    } catch (error) {
      console.error("Failed to assign store:", error);
      alert("Failed to assign store. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnassignStore = async (userId: string, storeId: string) => {
    if (!confirm("Are you sure you want to remove this store from the user?")) return;

    setLoadingId(userId);
    try {
      const response = await fetch("/api/admin/assign-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          storeId,
          action: "unassign"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unassign store");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to unassign store:", error);
      alert("Failed to unassign store. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Website URL</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assigned Stores</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assign New Store</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user) => {
                const userStores = stores.filter(s => s.userId === user.id);
                
                return (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{user.name}</td>
                    <td className="p-4 align-middle text-muted-foreground">{user.email}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={urls[user.id] || ""}
                          onChange={(e) => handleUrlChange(user.id, e.target.value)}
                          className="flex h-9 w-full min-w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-2">
                        {userStores.length > 0 ? (
                          userStores.map(store => (
                            <div key={store.id} className="flex items-center justify-between gap-2 bg-zinc-100 rounded-md px-2 py-1">
                              <span className="text-xs font-medium">{store.name}</span>
                              <button
                                onClick={() => handleUnassignStore(user.id, store.id)}
                                className="text-zinc-500 hover:text-red-600 focus:outline-none"
                                title="Remove Store"
                              >
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <select
                        className="flex h-9 w-full min-w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onChange={(e) => {
                          if (e.target.value) {
                            if (confirm(`Assign store "${e.target.options[e.target.selectedIndex].text}" to ${user.name}?`)) {
                              handleAssignStore(user.id, e.target.value);
                            }
                            e.target.value = ""; // Reset dropdown
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Store...</option>
                        {stores
                          .filter(s => s.userId !== user.id) // Only show stores NOT already owned by this user
                          .map(store => (
                            <option key={store.id} value={store.id}>
                              {store.name} {store.userId ? "(Reassign)" : "(Unassigned)"}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        {urls[user.id] && (
                          <a
                            href={urls[user.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9"
                            title="Visit Website"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(user.id)}
                          disabled={loadingId === user.id}
                        >
                          {loadingId === user.id ? (
                            <span className="animate-spin mr-2">⏳</span>
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save URL
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
