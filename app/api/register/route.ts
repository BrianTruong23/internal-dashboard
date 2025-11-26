import { NextRequest, NextResponse } from "next/server";
import { userStorage } from "@/lib/users";

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
    const user = userStorage.create(email, password, name);
    console.log(`[Register API] User created successfully: ${user.id}`);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`[Register API] Error:`, error);
    if (error.message === "User already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
