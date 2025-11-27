"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Store } from "lucide-react";

interface OwnerOption {
  id: string;
  email: string;
  name: string;
}

export function CreateStoreForm({ owners }: { owners: OwnerOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    url: "",
    category: "",
    owner_id: "",
  });

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-update slug if it matches the previous auto-generated version (or is empty)
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-') 
        ? name.toLowerCase().replace(/\s+/g, '-') 
        : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.owner_id) {
        throw new Error("Please select an owner for the store.");
      }

      // Find selected owner details
      const selectedOwner = owners.find(o => o.id === formData.owner_id);

      const response = await fetch("/api/admin/create-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          url: formData.url,
          category: formData.category,
          owner_id: formData.owner_id,
          owner_name: selectedOwner?.name,
          owner_email: selectedOwner?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create store");
      }

      router.push("/stores"); // Redirect to stores list
      router.refresh();
    } catch (err: any) {
      console.error("Error creating store:", err);
      setError(err.message || "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Store Name</label>
          <input
            id="name"
            required
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="My Awesome Store"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">Store Slug (URL Identifier)</label>
          <input
            id="slug"
            required
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="my-awesome-store"
          />
          <p className="text-xs text-muted-foreground">
            Used in URLs, e.g. /store/my-awesome-store
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">Store URL</label>
          <input
            id="url"
            required
            type="text" // Could be url type but text is more flexible for "example.com" vs "https://..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">Category</label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Select a category</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home & Garden</option>
            <option value="beauty">Beauty & Health</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="owner" className="text-sm font-medium">Assign Owner</label>
          <select
            id="owner"
            required
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Select an owner</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name || owner.email} ({owner.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Every store must belong to a registered user.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Store...
            </>
          ) : (
            <>
              <Store className="mr-2 h-4 w-4" />
              Create Store
            </>
          )}
        </button>
      </form>
    </div>
  );
}
