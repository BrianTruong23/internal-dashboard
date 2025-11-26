import { createClient } from "@/lib/supabase/server";
import { Shield, User, Store } from "lucide-react";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const supabase = await createClient();
  
  // Check auth and role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUserData } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUserData?.role !== "admin") {
    redirect("/");
  }

  // Fetch all users with their stores
  const { data: users, error } = await supabase
    .from("service_users")
    .select(`
      *,
      stores (
        name
      )
    `);

  if (error) {
    console.error("Error fetching users:", error);
    return <div>Error loading users</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registered Users</h2>
          <p className="text-muted-foreground">
            Manage users and their store listings
          </p>
        </div>
      </div>
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Stores
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Store Names
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users?.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        {/* Name is not in service_users table yet, using email or metadata if available */}
                        <span className="font-medium">User</span> 
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {user.email}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{user.stores?.length || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        {user.stores?.map((store: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary px-2 py-1 rounded-md inline-block"
                          >
                            {store.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
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
