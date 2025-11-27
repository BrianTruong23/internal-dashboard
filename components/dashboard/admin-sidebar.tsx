"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Store, LogOut, ExternalLink, Settings, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    color: "text-pink-700",
  },
  {
    label: "Stores",
    icon: Store,
    href: "/stores",
    color: "text-violet-500",
  },
  {
    label: "Assign Stores",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
  {
    label: "Create Store",
    icon: ShoppingCart,
    href: "/create-store",
    color: "text-green-700",
  },
];

export function AdminSidebar({ storeUrl }: { storeUrl?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black font-bold">
              A
            </div>
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
         <button
            onClick={handleLogout}
            className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
          >
            <div className="flex items-center flex-1">
              <LogOut className="h-5 w-5 mr-3 text-red-500" />
              Logout
            </div>
          </button>
      </div>
    </div>
  );
}
