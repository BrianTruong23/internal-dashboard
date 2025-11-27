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
    const { name, slug, url, category, owner_id, owner_name, owner_email } = body;

    if (!name || !owner_id) {
      return NextResponse.json({ error: "Name and Owner are required" }, { status: 400 });
    }

    // 1. Create the store
    const { data: store, error: insertError } = await supabase
      .from("stores")
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        url,
        category,
        owner_id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 2. Ensure user is in 'owners' table
    if (owner_name && owner_email) {
      const { error: ownerError } = await supabase
        .from("owners")
        .upsert({
          id: owner_id,
          email: owner_email,
          name: owner_name,
        }, { onConflict: 'id' });
        
      if (ownerError) console.error("Error upserting owner:", ownerError);
    }

    // 3. Update service_users role to 'owner'
    const { error: roleError } = await supabase
      .from("service_users")
      .update({ role: "owner" })
      .eq("id", owner_id);

    if (roleError) console.error("Error updating user role:", roleError);

    return NextResponse.json({ success: true, store });
  } catch (error: any) {
    console.error("Error in create-store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
