import { useState, useEffect } from "react";
import { UserProfile, PrimalClass } from "../types/user";
import { loginUser, registerUser, logoutUser, fetchActiveSession } from "../lib/auth";

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    setLoading(true);
    try {
      const { user: activeUser, profile: activeProfile } = await fetchActiveSession();
      setUser(activeUser);
      setProfile(activeProfile);
    } catch (e: any) {
      setError(e.message || "Failed to retrieve active session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const res = await loginUser(email, password);
    if (res.success) {
      setUser(res.user);
      setProfile(res.profile);
    } else {
      setError(res.error || "Login credentials rejected.");
    }
    setLoading(false);
    return res;
  };

  const register = async (email: string, password: string, primalClass: PrimalClass, displayName: string) => {
    setLoading(true);
    setError(null);
    const res = await registerUser(email, password, primalClass, displayName);
    if (res.success) {
      setUser(res.user);
      setProfile(res.profile);
    } else {
      setError(res.error || "Register request rejected.");
    }
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    refreshSession: checkSession
  };
}
