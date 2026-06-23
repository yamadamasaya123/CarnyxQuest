import { getSupabase, isSupabaseConfigured } from "./supabase";
import { UserProfile, PrimalClass } from "../types/user";
import { db } from "../src/lib/db";

export interface AuthResponse {
  success: boolean;
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  error?: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const profile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        displayName: profileData.display_name,
        primalClass: profileData.primal_class,
        level: profileData.level,
        xp: profileData.xp,
        goldenPoints: profileData.golden_points,
        createdAt: profileData.created_at
      };

      return { success: true, user: { id: data.user.id, email: data.user.email || "" }, profile };
    } catch (err: any) {
      return { success: false, user: null, profile: null, error: err.message || "Login failed via Supabase" };
    }
  } else {
    // Local fallback
    const res = db.login(email, password);
    if (res.success && res.profile) {
      const p = res.profile as any;
      const profile: UserProfile = {
        id: p.id,
        email: p.email || email,
        displayName: p.displayName,
        primalClass: p.primalClass as PrimalClass,
        level: p.level,
        xp: p.experience || p.xp || 0,
        goldenPoints: p.goldPoints || p.goldenPoints || 100,
        createdAt: p.createdAt || p.joinedAt || new Date().toISOString()
      };
      return { success: true, user: { id: p.id, email: profile.email }, profile };
    }
    return { success: false, user: null, profile: null, error: "Invalid credentials (Local mode)" };
  }
}

export async function registerUser(email: string, password: string, primalClass: PrimalClass, displayName: string): Promise<AuthResponse> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("No user created");

      const profileRow = {
        id: data.user.id,
        email,
        display_name: displayName,
        primal_class: primalClass,
        level: 1,
        xp: 0,
        golden_points: 10
      };

      const { data: profileResult, error: profileErr } = await supabase
        .from("profiles")
        .insert(profileRow)
        .select()
        .single();

      if (profileErr) throw profileErr;

      const profile: UserProfile = {
        id: profileResult.id,
        email: profileResult.email,
        displayName: profileResult.display_name,
        primalClass: profileResult.primal_class,
        level: profileResult.level,
        xp: profileResult.xp,
        goldenPoints: profileResult.golden_points,
        createdAt: profileResult.created_at
      };

      return { success: true, user: { id: data.user.id, email }, profile };
    } catch (err: any) {
      return { success: false, user: null, profile: null, error: err.message || "Registration failed via Supabase" };
    }
  } else {
    // Local fallback
    const res = db.register(email, displayName, primalClass as any);
    if (res.success && res.profile) {
      const p = res.profile as any;
      const profile: UserProfile = {
        id: p.id,
        email: p.email || email,
        displayName: p.displayName,
        primalClass: p.primalClass as PrimalClass,
        level: p.level,
        xp: p.experience || p.xp || 0,
        goldenPoints: p.goldPoints || p.goldenPoints || 100,
        createdAt: p.createdAt || p.joinedAt || new Date().toISOString()
      };
      return { success: true, user: { id: p.id, email: profile.email }, profile };
    }
    return { success: false, user: null, profile: null, error: res.error || "Registration failed (Local mode)" };
  }
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  } else {
    db.logout();
  }
}

export async function fetchActiveSession(): Promise<{ user: { id: string; email: string } | null; profile: UserProfile | null }> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return { user: null, profile: null };

      const { data: profileResult, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !profileResult) return { user: { id: session.user.id, email: session.user.email || "" }, profile: null };

      const profile: UserProfile = {
        id: profileResult.id,
        email: profileResult.email,
        displayName: profileResult.display_name,
        primalClass: profileResult.primal_class,
        level: profileResult.level,
        xp: profileResult.xp,
        goldenPoints: profileResult.golden_points,
        createdAt: profileResult.created_at
      };

      return { user: { id: session.user.id, email: session.user.email || "" }, profile };
    } catch {
      return { user: null, profile: null };
    }
  } else {
    const s = db.getActiveUserAndProfile();
    if (s.user && s.profile) {
      const p = s.profile as any;
      const profile: UserProfile = {
        id: p.id,
        email: p.email || s.user.email || "chieftain@tribemail.com",
        displayName: p.displayName,
        primalClass: p.primalClass as PrimalClass,
        level: p.level,
        xp: p.experience || p.xp || 0,
        goldenPoints: p.goldPoints || p.goldenPoints || 100,
        createdAt: p.createdAt || p.joinedAt || new Date().toISOString()
      };
      return { user: { id: p.id, email: profile.email }, profile };
    }
    return { user: null, profile: null };
  }
}
