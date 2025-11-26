import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const results: any = {
    checks: []
  };

  // Check if users exist in service_users
  const { data: serviceUsers, error: serviceUsersError } = await supabase
    .from("service_users")
    .select("*");

  results.checks.push({
    test: "service_users table",
    success: !serviceUsersError,
    data: serviceUsers,
    error: serviceUsersError?.message
  });

  // Try to sign in with admin credentials
  const { data: adminSignIn, error: adminError } = await supabase.auth.signInWithPassword({
    email: "admin@example.com",
    password: "password123"
  });

  results.checks.push({
    test: "Admin login test",
    success: !adminError,
    userExists: !!adminSignIn?.user,
    error: adminError?.message
  });

  // Try to sign in with owner credentials
  const { data: ownerSignIn, error: ownerError } = await supabase.auth.signInWithPassword({
    email: "owner@example.com",
    password: "password123"
  });

  results.checks.push({
    test: "Owner login test",
    success: !ownerError,
    userExists: !!ownerSignIn?.user,
    error: ownerError?.message
  });

  return NextResponse.json(results);
}
