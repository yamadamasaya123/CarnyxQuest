import { NextResponse } from "next/server";
import { PRIMAL_FOOD_CATALOG } from "../../../lib/nutrition";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    // Simple search filter matching prefix or content
    const items = PRIMAL_FOOD_CATALOG.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ success: true, results: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
