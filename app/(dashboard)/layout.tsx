"use client";

import { useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { StoreOwnerSidebar } from "@/components/dashboard/store-owner-sidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const SidebarComponent = userRole === "admin" ? AdminSidebar : StoreOwnerSidebar;

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <SidebarComponent />
      </div>
      <main className="md:pl-72">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
