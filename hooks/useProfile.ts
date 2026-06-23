import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "../types/user";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { fetchActiveSession } from "../lib/auth";
import { db } from "../src/lib/db";

export function useProfile(profileId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfileDetails = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = getSupabase();
        
        // Profiles
        const { data: prof, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (prof && !error) {
          setProfile({
            id: prof.id,
            email: prof.email,
            displayName: prof.display_name,
            primalClass: prof.primal_class,
            level: prof.level,
            xp: prof.xp,
            goldenPoints: prof.golden_points,
            createdAt: prof.created_at
          });
        }

        // Streak
        const { data: str } = await supabase
          .from("streaks")
          .select("*")
          .eq("profile_id", profileId)
          .maybeSingle();

        if (str) {
          setStreak({ current: str.current_streak, longest: str.longest_streak });
        } else {
          setStreak({ current: 0, longest: 0 });
        }
      } else {
        // Fallback local db
        const s = db.getActiveUserAndProfile();
        if (s.profile && s.profile.id === profileId) {
          const p = s.profile as any;
          setProfile({
            id: p.id,
            email: p.email || s.user?.email || "chieftain@tribemail.com",
            displayName: p.displayName,
            primalClass: p.primalClass as any,
            level: p.level,
            xp: p.experience || p.xp || 0,
            goldenPoints: p.goldPoints || p.goldenPoints || 100,
            createdAt: p.createdAt || p.joinedAt || new Date().toISOString()
          });
        }
        
        try {
          const sRecord = db.getStreak(profileId);
          if (sRecord) {
            setStreak({ current: sRecord.currentStreak, longest: sRecord.longestStreak });
          } else {
            setStreak({ current: 1, longest: 1 });
          }
        } catch {
          setStreak({ current: 1, longest: 1 });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadProfileDetails();
  }, [loadProfileDetails]);

  return {
    profile,
    streak,
    loading,
    refreshProfile: loadProfileDetails
  };
}
