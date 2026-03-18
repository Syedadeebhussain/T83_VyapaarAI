import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const users: any[] = [];

export async function POST(req: Request) {

  const { email, password } = await req.json();

  const user = users.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({
    token,
  });
}
