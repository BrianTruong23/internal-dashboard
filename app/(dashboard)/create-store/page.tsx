import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateStoreForm } from "@/components/stores/create-store-form";
import { getUserRole } from "@/lib/auth-helper";

export default async function CreateStorePage() {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin role
  const userRole = await getUserRole(supabase, user.id);
  if (userRole !== "admin") {
    redirect("/");
  }

  // Fetch potential owners (Admins + Owners)
  // We want to allow assigning the store to any registered user who can be an owner.
  // Based on the schema, any service_user can be an owner.
  // Let's fetch from 'owners' table AND 'admins' table and merge them.
  
  const { data: owners } = await supabase
    .from("owners")
    .select("id, email, name")
    .order("created_at", { ascending: false });

  const { data: admins } = await supabase
    .from("admins")
    .select("id, email, name");

  // Merge and deduplicate
  const allPotentialOwners = [
    ...(admins || []),
    ...(owners || [])
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Store</h2>
          <p className="text-muted-foreground">
            Add a new store and assign it to an owner
          </p>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
        <CreateStoreForm owners={allPotentialOwners} />
      </div>
    </div>
  );
}
