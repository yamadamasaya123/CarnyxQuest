import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";
import { db } from "../../../src/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ success: false, error: "Missing user identification index" }, { status: 400 });
    }

    let records = [];
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("progress_records")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        records = data;
      }
    } else {
      records = db.getProgressRecords().filter(p => p.profileId === profileId);
    }

    return NextResponse.json({ success: true, records });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { profileId, weightKg, ketonesMmol, notes } = await req.json();

    if (!profileId || !weightKg) {
      return NextResponse.json({ success: false, error: "Deficient weight or user indicators" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("progress_records")
        .insert({
          profile_id: profileId,
          weight_kg: parseFloat(weightKg),
          ketones_mmol: ketonesMmol ? parseFloat(ketonesMmol) : undefined,
          notes: notes || "Telemetry recorded"
        });

      if (error) throw error;
    } else {
      db.logProgress(profileId, parseFloat(weightKg), ketonesMmol ? parseFloat(ketonesMmol) : undefined, notes);
    }

    return NextResponse.json({ success: true, message: "Telemetry weight entry documented." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
