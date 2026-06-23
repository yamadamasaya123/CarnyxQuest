import { NextResponse } from "next/server";
import { createMealLog, fetchUserMeals } from "../../../lib/nutrition";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ success: false, error: "Missing active profile identifier" }, { status: 400 });
    }

    const items = await fetchUserMeals(profileId);
    return NextResponse.json({ success: true, meals: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { profileId, name, weightG, nutrition, isCarnivore } = await req.json();

    if (!profileId || !name || !weightG || !nutrition) {
      return NextResponse.json({ success: false, error: "Deficient payload coordinates" }, { status: 400 });
    }

    const meal = await createMealLog(profileId, name, weightG, nutrition, isCarnivore);
    return NextResponse.json({ success: true, meal });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
