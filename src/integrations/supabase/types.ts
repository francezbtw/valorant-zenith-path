export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          id: string
          min_tier: Database["public"]["Enums"]["plan_tier"]
          published: boolean
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          min_tier?: Database["public"]["Enums"]["plan_tier"]
          published?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          min_tier?: Database["public"]["Enums"]["plan_tier"]
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          kind: Database["public"]["Enums"]["post_kind"]
          meta: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          kind?: Database["public"]["Enums"]["post_kind"]
          meta?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          kind?: Database["public"]["Enums"]["post_kind"]
          meta?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          updated_at: string
          uses: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          min_tier: Database["public"]["Enums"]["plan_tier"]
          position: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          min_tier?: Database["public"]["Enums"]["plan_tier"]
          position?: number
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          min_tier?: Database["public"]["Enums"]["plan_tier"]
          position?: number
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider: string | null
          provider_ref: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider?: string | null
          provider_ref?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          provider?: string | null
          provider_ref?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          last_position_seconds: number
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          last_position_seconds?: number
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          last_position_seconds?: number
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number
          exercises: Json
          id: string
          materials: Json
          module_id: string
          position: number
          published: boolean
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_path: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number
          exercises?: Json
          id?: string
          materials?: Json
          module_id: string
          position?: number
          published?: boolean
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_path?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number
          exercises?: Json
          id?: string
          materials?: Json
          module_id?: string
          position?: number
          published?: boolean
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          meeting_url: string | null
          mentor_name: string
          notes: string | null
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_url?: string | null
          mentor_name?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_url?: string | null
          mentor_name?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string | null
          cover_color: string | null
          created_at: string
          description: string | null
          id: string
          position: number
          published: boolean
          slug: string
          tier: Database["public"]["Enums"]["plan_tier"]
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          cover_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          published?: boolean
          slug: string
          tier?: Database["public"]["Enums"]["plan_tier"]
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          cover_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          published?: boolean
          slug?: string
          tier?: Database["public"]["Enums"]["plan_tier"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          error: string | null
          event_id: string | null
          event_type: string | null
          id: string
          payload: Json
          processed: boolean
          provider: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          processed?: boolean
          provider: string
        }
        Update: {
          created_at?: string
          error?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          processed?: boolean
          provider?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          plan: Database["public"]["Enums"]["plan_tier"] | null
          provider: string | null
          provider_ref: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"] | null
          provider?: string | null
          provider_ref?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"] | null
          provider?: string | null
          provider_ref?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          checkout_url: string | null
          created_at: string
          currency: string
          features: Json
          highlight: boolean
          id: string
          mercadopago_price_cents: number | null
          name: string
          position: number
          price_cents: number
          slug: string
          stripe_price_id: string | null
          tagline: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          checkout_url?: string | null
          created_at?: string
          currency?: string
          features?: Json
          highlight?: boolean
          id?: string
          mercadopago_price_cents?: number | null
          name: string
          position?: number
          price_cents?: number
          slug: string
          stripe_price_id?: string | null
          tagline?: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          checkout_url?: string | null
          created_at?: string
          currency?: string
          features?: Json
          highlight?: boolean
          id?: string
          mercadopago_price_cents?: number | null
          name?: string
          position?: number
          price_cents?: number
          slug?: string
          stripe_price_id?: string | null
          tagline?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked: boolean
          created_at: string
          current_rank: string | null
          email: string | null
          full_name: string | null
          id: string
          last_seen_at: string | null
          riot_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          current_rank?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          riot_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          current_rank?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          riot_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rank_history: {
        Row: {
          created_at: string
          id: string
          note: string | null
          rank_tier: string
          recorded_at: string
          rr: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          rank_tier: string
          recorded_at?: string
          rr?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          rank_tier?: string
          recorded_at?: string
          rr?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          banner_url: string | null
          created_at: string
          discord_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          project_name: string
          support_email: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          discord_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          project_name?: string
          support_email?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          discord_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          project_name?: string
          support_email?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      student_stats: {
        Row: {
          active_days: number
          created_at: string
          current_tier: string | null
          entry_tier: string | null
          goal_tier: string
          headshot_pct: number
          hours_studied: number
          joined_at: string
          last_active_date: string | null
          mentorships_done: number
          streak_days: number
          updated_at: string
          user_id: string
          win_rate: number
          xp: number
        }
        Insert: {
          active_days?: number
          created_at?: string
          current_tier?: string | null
          entry_tier?: string | null
          goal_tier?: string
          headshot_pct?: number
          hours_studied?: number
          joined_at?: string
          last_active_date?: string | null
          mentorships_done?: number
          streak_days?: number
          updated_at?: string
          user_id: string
          win_rate?: number
          xp?: number
        }
        Update: {
          active_days?: number
          created_at?: string
          current_tier?: string | null
          entry_tier?: string | null
          goal_tier?: string
          headshot_pct?: number
          hours_studied?: number
          joined_at?: string
          last_active_date?: string | null
          mentorships_done?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
          win_rate?: number
          xp?: number
        }
        Relationships: []
      }
      student_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          done: boolean
          id: string
          position: number
          task_key: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          done?: boolean
          id?: string
          position?: number
          task_key: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          done?: boolean
          id?: string
          position?: number
          task_key?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_key: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_key: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_key?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valorant_accounts: {
        Row: {
          created_at: string
          puuid: string | null
          region: string
          riot_name: string
          riot_tag: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          puuid?: string | null
          region?: string
          riot_name: string
          riot_tag: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          puuid?: string | null
          region?: string
          riot_name?: string
          riot_tag?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_rank: string | null
          full_name: string | null
          id: string | null
          riot_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_rank?: string | null
          full_name?: string | null
          id?: string | null
          riot_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_rank?: string | null
          full_name?: string | null
          id?: string | null
          riot_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_plan: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["plan_tier"]
      }
      has_plan_access: {
        Args: {
          _required: Database["public"]["Enums"]["plan_tier"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      plan_rank: {
        Args: { _plan: Database["public"]["Enums"]["plan_tier"] }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      plan_tier: "basico" | "intermediario" | "mentoria"
      post_kind: "post" | "achievement" | "evolution" | "certificate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      plan_tier: ["basico", "intermediario", "mentoria"],
      post_kind: ["post", "achievement", "evolution", "certificate"],
    },
  },
} as const
