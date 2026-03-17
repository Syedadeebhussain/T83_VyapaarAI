
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const users: any[] = [];

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    name,
    email,
    password: hashedPassword,
  });

  return NextResponse.json({
    message: "User registered",
  });
}
