import { NextResponse } from "next/server";
import { addXp, advanceChallengeProgress } from "../../../lib/gamification";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const { profileId, mood, waterMl, notes } = await req.json();

    if (!profileId) {
      return NextResponse.json({ success: false, error: "Missing user identification index" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      
      const checkinRow = {
        profile_id: profileId,
        checkin_date: new Date().toISOString().split("T")[0],
        mood: mood || "Balanced",
        water_intake_ml: waterMl || 2000,
        notes: notes || "Daily covenant logged",
        xp_earned: 20
      };

      const { error } = await supabase
        .from("daily_checkins")
        .insert(checkinRow);

      if (error) throw error;
    }

    // Award +20 XP Coordinates
    const xpRes = await addXp(profileId, 20, "Secured Daily Check-in Covenant");
    
    // Progress Daily consistent challenge progress
    await advanceChallengeProgress(profileId, "streak", 1);

    return NextResponse.json({ success: true, ...xpRes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
