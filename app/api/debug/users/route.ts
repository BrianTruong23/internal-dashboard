import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: users, error } = await supabase.from("service_users").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    totalUsers: users?.length || 0,
    users: users?.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
    })) || [],
  });
}
