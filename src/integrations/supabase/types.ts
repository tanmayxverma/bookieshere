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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      materials: {
        Row: {
          badge: string | null
          created_at: string
          description: string | null
          download_link: string
          exam: Database["public"]["Enums"]["exam_type"]
          id: string
          name: string
          popularity: number
          resource_type: Database["public"]["Enums"]["resource_type"]
          subject: Database["public"]["Enums"]["subject_type"]
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: string | null
          download_link: string
          exam: Database["public"]["Enums"]["exam_type"]
          id?: string
          name: string
          popularity?: number
          resource_type: Database["public"]["Enums"]["resource_type"]
          subject: Database["public"]["Enums"]["subject_type"]
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string | null
          download_link?: string
          exam?: Database["public"]["Enums"]["exam_type"]
          id?: string
          name?: string
          popularity?: number
          resource_type?: Database["public"]["Enums"]["resource_type"]
          subject?: Database["public"]["Enums"]["subject_type"]
          updated_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          last_heartbeat: string | null
          started_at: string
          status: string
          subject: string
          ypt_user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_heartbeat?: string | null
          started_at?: string
          status?: string
          subject: string
          ypt_user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_heartbeat?: string | null
          started_at?: string
          status?: string
          subject?: string
          ypt_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_ypt_user_id_fkey"
            columns: ["ypt_user_id"]
            isOneToOne: false
            referencedRelation: "ypt_users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          chapter: string | null
          correct_answer: Json
          created_at: string
          diagram_url: string | null
          id: string
          is_answered: boolean | null
          is_marked_for_review: boolean | null
          marks_negative: number
          marks_positive: number
          options: Json | null
          partial_marking: boolean | null
          question_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          solution: string | null
          subject: Database["public"]["Enums"]["subject_type"]
          test_id: string
          user_answer: Json | null
        }
        Insert: {
          chapter?: string | null
          correct_answer: Json
          created_at?: string
          diagram_url?: string | null
          id?: string
          is_answered?: boolean | null
          is_marked_for_review?: boolean | null
          marks_negative?: number
          marks_positive?: number
          options?: Json | null
          partial_marking?: boolean | null
          question_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          solution?: string | null
          subject: Database["public"]["Enums"]["subject_type"]
          test_id: string
          user_answer?: Json | null
        }
        Update: {
          chapter?: string | null
          correct_answer?: Json
          created_at?: string
          diagram_url?: string | null
          id?: string
          is_answered?: boolean | null
          is_marked_for_review?: boolean | null
          marks_negative?: number
          marks_positive?: number
          options?: Json | null
          partial_marking?: boolean | null
          question_number?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          solution?: string | null
          subject?: Database["public"]["Enums"]["subject_type"]
          test_id?: string
          user_answer?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          completed_at: string | null
          correct_count: number | null
          created_at: string
          duration_minutes: number
          exam_type: Database["public"]["Enums"]["jee_exam_type"]
          id: string
          incorrect_count: number | null
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["test_status"]
          syllabus: Json
          total_marks: number
          total_questions: number
          unattempted_count: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          correct_count?: number | null
          created_at?: string
          duration_minutes?: number
          exam_type: Database["public"]["Enums"]["jee_exam_type"]
          id?: string
          incorrect_count?: number | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          syllabus?: Json
          total_marks?: number
          total_questions?: number
          unattempted_count?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          correct_count?: number | null
          created_at?: string
          duration_minutes?: number
          exam_type?: Database["public"]["Enums"]["jee_exam_type"]
          id?: string
          incorrect_count?: number | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          syllabus?: Json
          total_marks?: number
          total_questions?: number
          unattempted_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ypt_room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          ypt_user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          ypt_user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          ypt_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ypt_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "ypt_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ypt_room_members_ypt_user_id_fkey"
            columns: ["ypt_user_id"]
            isOneToOne: false
            referencedRelation: "ypt_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ypt_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          emoji: string | null
          id: string
          is_permanent: boolean
          last_activity_at: string
          max_participants: number | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_permanent?: boolean
          last_activity_at?: string
          max_participants?: number | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_permanent?: boolean
          last_activity_at?: string
          max_participants?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ypt_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ypt_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ypt_todos: {
        Row: {
          completed: boolean
          created_at: string
          created_date: string
          id: string
          priority: string | null
          sort_order: number | null
          subject: string | null
          text: string
          time_allotted: number | null
          ypt_user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          created_date?: string
          id?: string
          priority?: string | null
          sort_order?: number | null
          subject?: string | null
          text: string
          time_allotted?: number | null
          ypt_user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          created_date?: string
          id?: string
          priority?: string | null
          sort_order?: number | null
          subject?: string | null
          text?: string
          time_allotted?: number | null
          ypt_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ypt_todos_ypt_user_id_fkey"
            columns: ["ypt_user_id"]
            isOneToOne: false
            referencedRelation: "ypt_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ypt_users: {
        Row: {
          created_at: string
          device_id: string
          id: string
          jee_focus_year: string
          last_active_at: string
          name: string
          name_change_history: Json
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          jee_focus_year: string
          last_active_at?: string
          name: string
          name_change_history?: Json
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          jee_focus_year?: string
          last_active_at?: string
          name?: string
          name_change_history?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_inactive_rooms: { Args: never; Returns: undefined }
      cleanup_old_sessions: { Args: never; Returns: undefined }
      cleanup_stale_sessions: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      exam_type: "jee" | "other_pcm"
      jee_exam_type: "jee_main" | "jee_advanced"
      question_type:
        | "single_correct"
        | "multi_correct"
        | "numerical"
        | "integer"
        | "matrix_match"
        | "paragraph"
      resource_type:
        | "books"
        | "notes"
        | "pyqs"
        | "practice_sheets"
        | "test_series"
        | "modules"
        | "crux"
      subject_type: "physics" | "chemistry" | "mathematics" | "combined"
      test_status: "draft" | "in_progress" | "completed" | "abandoned"
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
      app_role: ["admin", "user"],
      exam_type: ["jee", "other_pcm"],
      jee_exam_type: ["jee_main", "jee_advanced"],
      question_type: [
        "single_correct",
        "multi_correct",
        "numerical",
        "integer",
        "matrix_match",
        "paragraph",
      ],
      resource_type: [
        "books",
        "notes",
        "pyqs",
        "practice_sheets",
        "test_series",
        "modules",
        "crux",
      ],
      subject_type: ["physics", "chemistry", "mathematics", "combined"],
      test_status: ["draft", "in_progress", "completed", "abandoned"],
    },
  },
} as const
