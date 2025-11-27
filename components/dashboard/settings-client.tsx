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
    } catch (error) {
      console.error("Failed to save website:", error);
      alert("Failed to save website. Please try again.");
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
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user) => (
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
                        className="flex h-9 w-full min-w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
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
                        Save
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
