import { NextResponse } from "next/server";
import { loginUser, registerUser } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { action, email, password, primalClass, displayName } = await req.json();

    if (action === "login") {
      const res = await loginUser(email, password);
      return NextResponse.json(res);
    } else if (action === "register") {
      const res = await registerUser(email, password, primalClass, displayName || email.split("@")[0]);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: "Unsupported operation coordinates" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal auth failure" }, { status: 500 });
  }
}
