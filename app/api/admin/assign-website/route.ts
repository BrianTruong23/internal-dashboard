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
    const { userId, url } = body;

    if (!userId || !url) {
      return NextResponse.json(
        { error: "User ID and URL are required" },
        { status: 400 }
      );
    }

    // Update or Insert store for the user
    // We assume one store per user for now, or we find the store by owner_id
    
    // First check if store exists
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", userId)
      .single();

    let result;
    if (existingStore) {
      // Update
      result = await supabase
        .from("stores")
        .update({ url })
        .eq("id", existingStore.id)
        .select()
        .single();
    } else {
      // Create new store
      result = await supabase
        .from("stores")
        .insert({
          owner_id: userId,
          name: "My Store", // Default name
          url: url,
          slug: "store-" + userId.slice(0, 8)
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json(
      {
        success: true,
        store: result.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[Assign Website API] Error:`, error);
    return NextResponse.json(
      { error: "Failed to assign website" },
      { status: 500 }
    );
  }
}
