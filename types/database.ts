export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // matches auth.users.id
          display_name: string;
          email: string;
          primal_class: "Chieftain" | "Hunter" | "gatherer" | "Berserker" | "Shaman";
          level: number;
          xp: number;
          golden_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      nutrition_data: {
        Row: {
          id: string;
          calories: number;
          protein: number;
          fat: number;
          carbs: number;
          source: string; // e.g. "USDA Central", "User Input"
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["nutrition_data"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["nutrition_data"]["Row"]>;
      };
      meals_log: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          weight_g: number;
          calories: number;
          protein_g: number;
          fat_g: number;
          carbs_g: number;
          is_carnivore_pure: boolean;
          nutrition_data_id?: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["meals_log"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["meals_log"]["Row"]>;
      };
      streaks: {
        Row: {
          id: string;
          profile_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["streaks"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
      };
      daily_checkins: {
        Row: {
          id: string;
          profile_id: string;
          checkin_date: string;
          mood?: string;
          water_intake_ml: number;
          notes?: string;
          xp_earned: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_checkins"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["daily_checkins"]["Row"]>;
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: "fasting" | "nutrition" | "combat";
          xp_reward: number;
          golden_points_reward: number;
          target_metric: string; // e.g. "fast_hours", "pure_carnivore_count"
          target_value: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["challenges"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["challenges"]["Row"]>;
      };
      user_challenges: {
        Row: {
          id: string;
          profile_id: string;
          challenge_id: string;
          current_progress: number;
          status: "active" | "completed" | "failed";
          started_at: string;
          completed_at?: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_challenges"]["Row"], "id" | "started_at">;
        Update: Partial<Database["public"]["Tables"]["user_challenges"]["Row"]>;
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon_name: string;
          rarity: "common" | "uncommon" | "rare" | "mythic";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["badges"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["badges"]["Row"]>;
      };
      user_badges: {
        Row: {
          id: string;
          profile_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_badges"]["Row"], "id" | "unlocked_at">;
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Row"]>;
      };
      progress_records: {
        Row: {
          id: string;
          profile_id: string;
          weight_kg: number;
          ketones_mmol?: number;
          notes?: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["progress_records"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["progress_records"]["Row"]>;
      };
      workouts: {
        Row: {
          id: string;
          profile_id: string;
          type: string; // e.g. "hunt", "primal_lifting"
          duration_mins: number;
          intensity: "low" | "medium" | "high";
          xp_earned: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workouts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workouts"]["Row"]>;
      };
      xp_transactions: {
        Row: {
          id: string;
          profile_id: string;
          amount: number;
          reason: string; // e.g. "Completed Fasting Session", "Log Meal"
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["xp_transactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["xp_transactions"]["Row"]>;
      };
      fasting_protocols: {
        Row: {
          id: string;
          name: string; // e.g. "16:8", "OMAD"
          description: string;
          duration_hours: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["fasting_protocols"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["fasting_protocols"]["Row"]>;
      };
      fasting_sessions: {
        Row: {
          id: string;
          profile_id: string;
          protocol_name: string; // e.g. "16:8", "OMAD", "24H"
          started_at: string;
          ended_at?: string;
          target_duration_hours: number;
          is_completed: boolean;
          xp_earned: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["fasting_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["fasting_sessions"]["Row"]>;
      };
      fasting_milestones: {
        Row: {
          id: string;
          fasting_session_id: string;
          hours_reached: number;
          milestone_name: string; // e.g. "Ketosis Starter", "Autophagy Peak"
          notified_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["fasting_milestones"]["Row"], "id" | "notified_at">;
        Update: Partial<Database["public"]["Tables"]["fasting_milestones"]["Row"]>;
      };
    };
  };
}
