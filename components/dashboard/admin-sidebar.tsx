"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Store, LogOut, Settings, ShoppingCart, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
  },
  {
    label: "Stores",
    icon: Store,
    href: "/stores",
  },
  {
    label: "Assign Stores",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Create Store",
    icon: ShoppingCart,
    href: "/create-store",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm shadow-sky-950/40">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-5 text-white">Admin Panel</p>
            <p className="text-xs font-medium text-zinc-500">Platform controls</p>
          </div>
        </Link>

        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Management
        </div>
        <nav className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                pathname === route.href
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  pathname === route.href
                    ? "bg-sky-50 text-sky-700"
                    : "bg-white/[0.04] text-zinc-500 group-hover:text-sky-300"
                )}
              >
                <route.icon className="h-4 w-4" />
              </span>
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-800/80 p-4">
        <div className="mb-3 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
          <p className="text-xs font-medium text-zinc-500">Signed in as</p>
          <p className="mt-1 text-sm font-semibold text-zinc-200">Administrator</p>
        </div>
        <button
          onClick={handleLogout}
          className="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-4 w-4 text-red-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
