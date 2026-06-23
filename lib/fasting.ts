import { getSupabase, isSupabaseConfigured } from "./supabase";
import { FastingSession } from "../types/fasting";
import { addXp, advanceChallengeProgress, unlockBadge } from "./gamification";
import { db } from "../src/lib/db";

export interface FastingProtocolInfo {
  name: string;
  durationHours: number;
  description: string;
}

export const EXCELLENT_PROTOCOLS: FastingProtocolInfo[] = [
  { name: "16:8", durationHours: 16, description: "Standard intermittent fasting protocol; great for cognitive recovery and autophagy start." },
  { name: "18:6", durationHours: 18, description: "Advanced protocol boosting natural cellular repair, burning fats, and regulating insulin." },
  { name: "OMAD", durationHours: 24, description: "One Meal A Day. Maximizes ketosis and gut flora resting windows." },
  { name: "24H", durationHours: 24, description: "Full day cellular cleanse reset; releases stem cells in major organs." },
  { name: "36H", durationHours: 36, description: "Extended purge. Maximizes fat adaptation and reduces systemic inflammation." }
];

export interface MilestoneInfo {
  hoursReached: number;
  milestoneName: string;
  description: string;
}

export const WATER_MILESTONES: MilestoneInfo[] = [
  { hoursReached: 4, milestoneName: "Glycogen Depletion", description: "Blood sugars settle as glycogen is drawn down from skeletal muscle." },
  { hoursReached: 8, milestoneName: "Lipid Transition", description: "Mitochondria ramp up metabolic utilization of triglycerides." },
  { hoursReached: 12, milestoneName: "Ketosis Ingress", description: "Ketone bodies rise above 0.5 mmol/L. Energy levels surge." },
  { hoursReached: 16, milestoneName: "Autophagy Active", description: "Sirtuins are recruited; lysosomes begin digesting senescent cells." },
  { hoursReached: 24, milestoneName: "Gut Regeneration", description: "Intestinal stem cells proliferate, healing tissue lining." },
  { hoursReached: 30, milestoneName: "Stem Cell Influx", description: "Immune defense rebuilds with fresh leukocytes." },
  { hoursReached: 36, milestoneName: "Autophagy Peak", description: "Deep cleansing of inflammatory proteins completed." }
];

export async function fetchCurrentActiveSession(profileId: string): Promise<FastingSession | null> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("fasting_sessions")
        .select("*")
        .eq("profile_id", profileId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        profileId: data.profile_id,
        protocolName: data.protocol_name,
        startedAt: data.started_at,
        endedAt: data.ended_at || undefined,
        targetDurationHours: data.target_duration_hours,
        isCompleted: data.is_completed,
        xpEarned: data.xp_earned
      };
    } catch {
      return null;
    }
  } else {
    // Local fallback
    const active = db.getActiveFastingSession(profileId);
    if (active) {
      const act = active as any;
      return {
        id: act.id,
        profileId: act.profileId,
        protocolName: act.protocolName || "OMAD",
        startedAt: act.startedAt || act.startTime || new Date().toISOString(),
        targetDurationHours: act.targetHours || 24,
        isCompleted: false,
        xpEarned: 0
      };
    }
    return null;
  }
}

export async function startFastingSession(profileId: string, protocolName: string, targetHours: number): Promise<FastingSession | null> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      
      // Stop any existing fasts first
      const active = await fetchCurrentActiveSession(profileId);
      if (active) {
        await stopFastingSession(active.id, false);
      }

      const insertRow = {
        profile_id: profileId,
        protocol_name: protocolName,
        started_at: new Date().toISOString(),
        target_duration_hours: targetHours,
        is_completed: false,
        xp_earned: 0
      };

      const { data, error } = await supabase
        .from("fasting_sessions")
        .insert(insertRow)
        .select()
        .single();

      if (error || !data) throw error;

      return {
        id: data.id,
        profileId: data.profile_id,
        protocolName: data.protocol_name,
        startedAt: data.started_at,
        targetDurationHours: data.target_duration_hours,
        isCompleted: data.is_completed,
        xpEarned: data.xp_earned
      };
    } catch {
      return null;
    }
  } else {
    // Local fallback
    let pId = "b301c380-60f3-4d44-be1f-f1f4b8cf6b43"; // Default OMAD
    if (protocolName === "16:8") pId = "b301c380-60f3-4d44-be1f-f1f4b8cf6b41";
    else if (protocolName === "18:6") pId = "b301c380-60f3-4d44-be1f-f1f4b8cf6b42";
    else if (protocolName === "24H") pId = "b301c380-60f3-4d44-be1f-f1f4b8cf6b44";
    else if (protocolName === "36H") pId = "b301c380-60f3-4d44-be1f-f1f4b8cf6b45";

    db.startFast(profileId, pId);
    const active = db.getActiveFastingSession(profileId);
    if (active) {
      const act = active as any;
      return {
        id: act.id,
        profileId: act.profileId,
        protocolName: act.protocolName || protocolName,
        startedAt: act.startedAt || act.startTime || new Date().toISOString(),
        targetDurationHours: act.targetHours || targetHours,
        isCompleted: false,
        xpEarned: 0
      };
    }
    return null;
  }
}

export async function stopFastingSession(sessionId: string, saveToHistory: boolean = true): Promise<FastingSession | null> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      
      // Fetch session details
      const { data: sessionData, error: fetchErr } = await supabase
        .from("fasting_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
        
      if (fetchErr || !sessionData) throw new Error("Fasting session not found");

      const endedAt = new Date().toISOString();
      const elapsedMilliseconds = new Date(endedAt).getTime() - new Date(sessionData.started_at).getTime();
      const elapsedHours = elapsedMilliseconds / (1000 * 60 * 60);
      const isCompleted = elapsedHours >= sessionData.target_duration_hours;
      
      // Calculate XP: 10 XP per hour fasted + 50 XP completion bonus if target reached
      let xpEarned = Math.round(elapsedHours * 10);
      if (isCompleted) xpEarned += 50;
      if (xpEarned < 5) xpEarned = 5; // minimum participation XP

      if (!saveToHistory) {
        // Just cancel
        const { error: deleteErr } = await supabase
          .from("fasting_sessions")
          .delete()
          .eq("id", sessionId);
        if (deleteErr) throw deleteErr;
        return null;
      }

      const updateRow = {
        ended_at: endedAt,
        is_completed: isCompleted,
        xp_earned: xpEarned,
        updated_at: new Date().toISOString()
      };

      const { data: updatedResult, error: updateErr } = await supabase
        .from("fasting_sessions")
        .update(updateRow)
        .eq("id", sessionId)
        .select()
        .single();

      if (updateErr || !updatedResult) throw updateErr;

      // Log earned XP automatically
      await addXp(sessionData.profile_id, xpEarned, `Autophagy completed (${sessionData.protocol_name})`);

      // Progress fasting challenge
      if (isCompleted) {
        await advanceChallengeProgress(sessionData.profile_id, "fasting", 1);
        await unlockBadge(sessionData.profile_id, "b_fast_pioneer");
      }

      return {
        id: updatedResult.id,
        profileId: updatedResult.profile_id,
        protocolName: updatedResult.protocol_name,
        startedAt: updatedResult.started_at,
        endedAt: updatedResult.ended_at || undefined,
        targetDurationHours: updatedResult.target_duration_hours,
        isCompleted: updatedResult.is_completed,
        xpEarned: updatedResult.xp_earned
      };
    } catch {
      return null;
    }
  } else {
    // Local fallback
    const res = db.stopFast("", sessionId, saveToHistory ? "complete" : "stop");
    if (res && res.session) {
      const s = res.session as any;
      return {
        id: s.id,
        profileId: s.profileId,
        protocolName: s.protocolName || "OMAD",
        startedAt: s.startedAt || s.startTime || new Date().toISOString(),
        endedAt: s.endedAt || s.endTime || new Date().toISOString(),
        targetDurationHours: s.targetHours || 24,
        isCompleted: s.isSuccess || (s.status === "completed"),
        xpEarned: res.xpEarned || 50
      };
    }
    return null;
  }
}

export async function fetchFastingHistory(profileId: string): Promise<FastingSession[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("fasting_sessions")
        .select("*")
        .eq("profile_id", profileId)
        .not("ended_at", "is", null)
        .order("started_at", { ascending: false });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        profileId: item.profile_id,
        protocolName: item.protocol_name,
        startedAt: item.started_at,
        endedAt: item.ended_at || undefined,
        targetDurationHours: item.target_duration_hours,
        isCompleted: item.is_completed,
        xpEarned: item.xp_earned
      }));
    } catch {
      return [];
    }
  } else {
    // Local fallback
    const historyList = db.getFastingHistory(profileId);
    return historyList.map(h => {
      const act = h as any;
      return {
        id: act.id,
        profileId: act.profileId,
        protocolName: act.protocolName || "OMAD",
        startedAt: act.startedAt || act.startTime || new Date().toISOString(),
        endedAt: act.endedAt || act.endTime || new Date().toISOString(),
        targetDurationHours: act.targetHours || 24,
        isCompleted: act.isSuccess || (act.status === "completed"),
        xpEarned: act.xpEarned || 50
      };
    });
  }
}
