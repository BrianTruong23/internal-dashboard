import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth-helper";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const userRole = await getUserRole(supabase, user.id);

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, storeId, userName, userEmail, action } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    // Handle Unassign
    if (action === "unassign") {
      const { error: unassignError } = await supabase
        .from("stores")
        .update({ owner_id: null })
        .eq("id", storeId);

      if (unassignError) {
        console.error("Error unassigning store:", unassignError);
        return NextResponse.json({ error: unassignError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    // Handle Assign (default)
    if (!userId) {
      return NextResponse.json({ error: "User ID is required for assignment" }, { status: 400 });
    }

    // 1. Update the store's owner_id
    const { error: storeError } = await supabase
      .from("stores")
      .update({ owner_id: userId })
      .eq("id", storeId);

    if (storeError) {
      console.error("Error assigning store:", storeError);
      return NextResponse.json({ error: storeError.message }, { status: 500 });
    }

    // 2. Ensure user is in 'owners' table
    // We need name and email. If not provided, we might fail to insert if they aren't there.
    if (userName && userEmail) {
      const { error: ownerError } = await supabase
        .from("owners")
        .upsert({
          id: userId,
          email: userEmail,
          name: userName,
        }, { onConflict: 'id' });
        
      if (ownerError) {
        console.error("Error upserting owner:", ownerError);
        // Don't fail the whole request, but log it. 
        // The store is assigned, but the user might not show up in "Owners" list if they weren't there.
      }
    }

    // 3. Update service_users role to 'owner'
    const { error: roleError } = await supabase
      .from("service_users")
      .update({ role: "owner" })
      .eq("id", userId);

    if (roleError) {
      console.error("Error updating user role:", roleError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in assign-store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
