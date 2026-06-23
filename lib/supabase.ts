import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

// Safely obtain environment variables (checking both process.env for Next.js and import.meta.env for Vite)
const getEnvVar = (name: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  const meta = import.meta as any;
  if (typeof import.meta !== "undefined" && meta.env && meta.env[name]) {
    return meta.env[name] as string;
  }
  return "";
};

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL") || getEnvVar("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnvVar("VITE_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    // Return null or stub - our application will check isSupabaseConfigured and fall back to our local replica db.
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}
