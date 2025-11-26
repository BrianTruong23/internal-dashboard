import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { StoreOwnerSidebar } from "@/components/dashboard/store-owner-sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from("service_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = userData?.role || "owner";
  
  // Fetch store URL for "Visit Website" link
  let storeUrl = "https://example.com"; // Default fallback
  if (userRole === "owner") {
    // Get the first store owned by this user
    const { data: storeData } = await supabase
      .from("stores")
      .select("url")
      .eq("owner_id", user.id)
      .single();
    
    if (storeData?.url) {
      storeUrl = storeData.url;
    }
  }

  const SidebarComponent = userRole === "admin" ? AdminSidebar : StoreOwnerSidebar;

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <SidebarComponent storeUrl={storeUrl} />
      </div>
      <main className="md:pl-72">
        {children}
      </main>
    </div>
  );
}
