import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const results = [];

  // 1. Create Admin User
  const adminEmail = "admin@example.com";
  const adminPassword = "password123";
  
  let { data: adminData, error: adminError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        role: "admin",
        name: "Admin User"
      }
    }
  });

  if (adminError && adminError.message.includes("already registered")) {
    // Try signing in if already exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
    });
    if (!signInError) {
        adminData = { user: signInData.user, session: signInData.session };
        results.push(`Admin user already exists: ${adminEmail}`);
    } else {
        results.push(`Failed to sign in existing admin: ${signInError.message}`);
    }
  } else if (adminError) {
    results.push(`Failed to create admin: ${adminError.message}`);
  } else {
    results.push(`Created admin user: ${adminEmail}`);
  }

  // 2. Create Owner User
  const ownerEmail = "owner@example.com";
  const ownerPassword = "password123";

  let { data: ownerData, error: ownerError } = await supabase.auth.signUp({
    email: ownerEmail,
    password: ownerPassword,
    options: {
      data: {
        role: "owner",
        name: "Store Owner"
      }
    }
  });

  if (ownerError && ownerError.message.includes("already registered")) {
     // Try signing in
     const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ownerEmail,
        password: ownerPassword
    });
    if (!signInError) {
        ownerData = { user: signInData.user, session: signInData.session };
        results.push(`Owner user already exists: ${ownerEmail}`);
    } else {
        results.push(`Failed to sign in existing owner: ${signInError.message}`);
    }
  } else if (ownerError) {
    results.push(`Failed to create owner: ${ownerError.message}`);
  } else {
    results.push(`Created owner user: ${ownerEmail}`);
  }

  // 3. Create Data for Owner (if we have a session)
  if (ownerData?.user && ownerData?.session) {
    // We need a client with the owner's session to bypass RLS for insert
    const ownerClient = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${ownerData.session.access_token}` } }
    });

    // Create Store
    const { data: store, error: storeError } = await ownerClient
        .from("stores")
        .insert({
            name: "Demo Store",
            url: "https://demo-store.com",
            slug: "demo-store",
            owner_id: ownerData.user.id
        })
        .select()
        .single();

    if (storeError) {
        results.push(`Failed to create store: ${storeError.message}`);
    } else {
        results.push(`Created store: ${store.name}`);

        // Create Orders
        const { error: ordersError } = await ownerClient
            .from("orders")
            .insert([
                {
                    store_id: store.id,
                    customer_email: "customer1@example.com",
                    total_price: 49.99,
                    status: "paid"
                },
                {
                    store_id: store.id,
                    customer_email: "customer2@example.com",
                    total_price: 120.50,
                    status: "shipped"
                }
            ]);
        
        if (ordersError) {
            results.push(`Failed to create orders: ${ordersError.message}`);
        } else {
            results.push(`Created 2 demo orders`);
        }
    }
  }

  return NextResponse.json({ results });
}
