"use client";

import { useSession } from "next-auth/react";
import { Overview } from "@/components/dashboard/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, TrendingUp, Activity } from "lucide-react";
import StoreOwnerOverviewPage from "@/components/dashboard/store-owner-overview";

// Admin Overview Component
function AdminOverview() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">165</div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Stores</h3>
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">298</div>
            <p className="text-xs text-muted-foreground">+24% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg Stores/User</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">1.8</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active This Week</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">86% activity rate</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Growth Over Time</h3>
            <p className="text-sm text-muted-foreground">
              User registrations and store additions
            </p>
          </div>
          <div className="p-6 pt-0 pl-2">
            <Overview />
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Recent Registrations</h3>
            <p className="text-sm text-muted-foreground">
              Latest users joined this week
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">sarah.j@example.com</p>
                </div>
                <div className="ml-auto font-medium text-sm">2 stores</div>
              </div>
              <div className="flex items-center">
                <div className="ml-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Mike Chen</p>
                  <p className="text-sm text-muted-foreground">mike.c@example.com</p>
                </div>
                <div className="ml-auto font-medium text-sm">1 store</div>
              </div>
              <div className="flex items-center">
                <div className="ml-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Emily Davis</p>
                  <p className="text-sm text-muted-foreground">emily.d@example.com</p>
                </div>
                <div className="ml-auto font-medium text-sm">3 stores</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  if (userRole === "admin") {
    return <AdminOverview />;
  }

  return <StoreOwnerOverviewPage />;
}
