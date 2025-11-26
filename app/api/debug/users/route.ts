import { NextResponse } from "next/server";
import { userStorage } from "@/lib/users";

export async function GET() {
  const users = userStorage.getAll();
  
  return NextResponse.json({
    totalUsers: users.length,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
    })),
  });
}
