import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, code } = body;

    if (!email || !password || !name || !code) {
      return NextResponse.json(
        { error: "All fields including registration code are required" },
        { status: 400 }
      );
    }

    if (code !== "superman") {
      console.log(`[Register API] Invalid code attempt: ${code}`);
      return NextResponse.json(
        { error: "Invalid registration code" },
        { status: 403 }
      );
    }

    console.log(`[Register API] Creating user: ${email}`);
    
    // Create user in Supabase Auth
    const supabase = await createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "owner", // Default role
        },
      },
    });

    if (signUpError) {
      console.error(`[Register API] Supabase Auth Error:`, signUpError);
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Note: The trigger in Supabase will handle creating the service_users row
    
    console.log(`[Register API] User created successfully: ${data.user.id}`);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`[Register API] Error:`, error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
