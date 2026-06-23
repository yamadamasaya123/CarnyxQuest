import { NextResponse } from "next/server";
import { addXp, unlockBadge, fetchChallenges } from "../../../lib/gamification";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ success: false, error: "Missing user identification index" }, { status: 400 });
    }

    const challengesList = await fetchChallenges(profileId);
    
    let unlockedBadges = [];
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("profile_id", profileId);
        
      if (data) unlockedBadges = data;
    } else {
      // Local check
      const ub = db.getUserBadges().filter(b => b.profileId === profileId);
      unlockedBadges = ub.map(item => {
        const bd = db.getBadges().find(badge => badge.id === item.badgeId);
        return {
          id: item.id,
          profile_id: profileId,
          badge_id: item.badgeId,
          unlocked_at: item.unlockedAt,
          badge: {
            id: bd?.id,
            name: bd?.name,
            description: bd?.description,
            icon_name: bd?.requirement,
            rarity: "common"
          }
        };
      });
    }

    return NextResponse.json({ 
      success: true, 
      challenges: challengesList,
      badges: unlockedBadges
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, profileId, amount, reason, badgeId } = await req.json();

    if (action === "addXp") {
      if (!profileId || !amount || !reason) {
        return NextResponse.json({ success: false, error: "Deficient XP payload coordinates" }, { status: 400 });
      }
      const result = await addXp(profileId, parseInt(amount), reason);
      return NextResponse.json(result);
    } else if (action === "unlockBadge") {
      if (!profileId || !badgeId) {
        return NextResponse.json({ success: false, error: "Deficient badge arguments" }, { status: 400 });
      }
      const success = await unlockBadge(profileId, badgeId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ success: false, error: "Operation action not recognized" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
