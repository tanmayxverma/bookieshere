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
      admin_credentials: {
        Row: {
          id: number
          password_hash_1: string
          password_hash_2: string
          updated_at: string
        }
        Insert: {
          id?: number
          password_hash_1: string
          password_hash_2: string
          updated_at?: string
        }
        Update: {
          id?: number
          password_hash_1?: string
          password_hash_2?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_login_attempts: {
        Row: {
          attempted_at: string
          device_id: string | null
          id: string
          ip_hash: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string
          device_id?: string | null
          id?: string
          ip_hash?: string | null
          success?: boolean
        }
        Update: {
          attempted_at?: string
          device_id?: string | null
          id?: string
          ip_hash?: string | null
          success?: boolean
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          session_id: string | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          session_id?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          session_id?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "admin_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          created_at: string
          device_id: string | null
          expires_at: string
          id: string
          last_seen_at: string
          token: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          expires_at: string
          id?: string
          last_seen_at?: string
          token: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          expires_at?: string
          id?: string
          last_seen_at?: string
          token?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          profile_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          profile_id: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
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
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          profile_id: string
          read_at: string
        }
        Insert: {
          id?: string
          notification_id: string
          profile_id: string
          read_at?: string
        }
        Update: {
          id?: string
          notification_id?: string
          profile_id?: string
          read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_reads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          is_pinned: boolean
          priority: string
          publish_at: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          priority?: string
          publish_at?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          priority?: string
          publish_at?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          created_at: string
          device_id: string | null
          display_name: string
          id: string
          is_banned: boolean
          is_muted: boolean
          moderation_note: string | null
          muted_until: string | null
          onboarded_at: string | null
          target_category: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string
          device_id?: string | null
          display_name?: string
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          moderation_note?: string | null
          muted_until?: string | null
          onboarded_at?: string | null
          target_category?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string
          device_id?: string | null
          display_name?: string
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          moderation_note?: string | null
          muted_until?: string | null
          onboarded_at?: string | null
          target_category?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      room_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_id: string
          ypt_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_id: string
          ypt_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_id?: string
          ypt_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "ypt_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_messages_ypt_user_id_fkey"
            columns: ["ypt_user_id"]
            isOneToOne: false
            referencedRelation: "ypt_users"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          flag_reason: string | null
          flagged: boolean
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
          flag_reason?: string | null
          flagged?: boolean
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
          flag_reason?: string | null
          flagged?: boolean
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
      support_chats: {
        Row: {
          created_at: string
          id: string
          last_admin_read_at: string | null
          last_message_at: string
          last_user_read_at: string | null
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_admin_read_at?: string | null
          last_message_at?: string
          last_user_read_at?: string | null
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_admin_read_at?: string | null
          last_message_at?: string
          last_user_read_at?: string | null
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_chats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          author_role: string
          body: string | null
          chat_id: string
          created_at: string
          id: string
          image_url: string | null
        }
        Insert: {
          author_role: string
          body?: string | null
          chat_id: string
          created_at?: string
          id?: string
          image_url?: string | null
        }
        Update: {
          author_role?: string
          body?: string | null
          chat_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "support_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_progress: {
        Row: {
          chapter_key: string
          created_at: string
          id: string
          profile_id: string
          stars: number
          updated_at: string
        }
        Insert: {
          chapter_key: string
          created_at?: string
          id?: string
          profile_id: string
          stars?: number
          updated_at?: string
        }
        Update: {
          chapter_key?: string
          created_at?: string
          id?: string
          profile_id?: string
          stars?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      ticket_messages: {
        Row: {
          author_profile_id: string | null
          author_role: string
          body: string
          created_at: string
          id: string
          read_by_admin_at: string | null
          read_by_user_at: string | null
          ticket_id: string
        }
        Insert: {
          author_profile_id?: string | null
          author_role: string
          body: string
          created_at?: string
          id?: string
          read_by_admin_at?: string | null
          read_by_user_at?: string | null
          ticket_id: string
        }
        Update: {
          author_profile_id?: string | null
          author_role?: string
          body?: string
          created_at?: string
          id?: string
          read_by_admin_at?: string | null
          read_by_user_at?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_admin: string | null
          category: string
          created_at: string
          description: string
          id: string
          last_message_at: string
          priority: string
          profile_id: string
          rejection_reason: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_admin?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          last_message_at?: string
          priority?: string
          profile_id: string
          rejection_reason?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_admin?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          last_message_at?: string
          priority?: string
          profile_id?: string
          rejection_reason?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          is_locked: boolean
          is_permanent: boolean
          last_activity_at: string
          max_participants: number | null
          name: string
          pin_hash: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_locked?: boolean
          is_permanent?: boolean
          last_activity_at?: string
          max_participants?: number | null
          name: string
          pin_hash?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_locked?: boolean
          is_permanent?: boolean
          last_activity_at?: string
          max_participants?: number | null
          name?: string
          pin_hash?: string | null
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
      auth_get_or_create_support_chat: {
        Args: never
        Returns: {
          created_at: string
          id: string
          last_admin_read_at: string | null
          last_message_at: string
          last_user_read_at: string | null
          profile_id: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "support_chats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cleanup_inactive_rooms: { Args: never; Returns: undefined }
      cleanup_old_messages: { Args: never; Returns: undefined }
      cleanup_old_sessions: { Args: never; Returns: undefined }
      cleanup_stale_sessions: { Args: never; Returns: undefined }
      get_guest_profile: {
        Args: { _device_id: string }
        Returns: {
          account_type: string
          avatar_url: string | null
          created_at: string
          device_id: string | null
          display_name: string
          id: string
          is_banned: boolean
          is_muted: boolean
          moderation_note: string | null
          muted_until: string | null
          onboarded_at: string | null
          target_category: string
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_create_ticket: {
        Args: {
          _category: string
          _description: string
          _device_id: string
          _priority: string
          _subject: string
        }
        Returns: {
          assigned_admin: string | null
          category: string
          created_at: string
          description: string
          id: string
          last_message_at: string
          priority: string
          profile_id: string
          rejection_reason: string | null
          status: string
          subject: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      guest_get_or_create_support_chat: {
        Args: { _device_id: string }
        Returns: {
          created_at: string
          id: string
          last_admin_read_at: string | null
          last_message_at: string
          last_user_read_at: string | null
          profile_id: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "support_chats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      guest_get_support_chat: {
        Args: { _device_id: string }
        Returns: {
          created_at: string
          id: string
          last_admin_read_at: string | null
          last_message_at: string
          last_user_read_at: string | null
          profile_id: string
          status: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "support_chats"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_get_ticket: {
        Args: { _device_id: string; _ticket_id: string }
        Returns: {
          assigned_admin: string | null
          category: string
          created_at: string
          description: string
          id: string
          last_message_at: string
          priority: string
          profile_id: string
          rejection_reason: string | null
          status: string
          subject: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_list_messages: {
        Args: { _device_id: string; _ticket_id: string }
        Returns: {
          author_profile_id: string | null
          author_role: string
          body: string
          created_at: string
          id: string
          read_by_admin_at: string | null
          read_by_user_at: string | null
          ticket_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "ticket_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_list_notification_reads: {
        Args: { _device_id: string }
        Returns: {
          id: string
          notification_id: string
          profile_id: string
          read_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notification_reads"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_list_support_messages: {
        Args: { _device_id: string }
        Returns: {
          author_role: string
          body: string | null
          chat_id: string
          created_at: string
          id: string
          image_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "support_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_list_syllabus_progress: {
        Args: { _device_id: string }
        Returns: {
          chapter_key: string
          created_at: string
          id: string
          profile_id: string
          stars: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "syllabus_progress"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_list_tickets: {
        Args: { _device_id: string }
        Returns: {
          assigned_admin: string | null
          category: string
          created_at: string
          description: string
          id: string
          last_message_at: string
          priority: string
          profile_id: string
          rejection_reason: string | null
          status: string
          subject: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      guest_mark_notification_read: {
        Args: { _device_id: string; _notification_id: string }
        Returns: undefined
      }
      guest_reset_syllabus_progress: {
        Args: { _device_id: string }
        Returns: undefined
      }
      guest_send_message: {
        Args: { _body: string; _device_id: string; _ticket_id: string }
        Returns: {
          author_profile_id: string | null
          author_role: string
          body: string
          created_at: string
          id: string
          read_by_admin_at: string | null
          read_by_user_at: string | null
          ticket_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ticket_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      guest_send_support_message: {
        Args: { _body: string; _device_id: string; _image_url?: string }
        Returns: {
          author_role: string
          body: string | null
          chat_id: string
          created_at: string
          id: string
          image_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "support_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      guest_upsert_syllabus_progress: {
        Args: { _chapter_key: string; _device_id: string; _stars: number }
        Returns: {
          chapter_key: string
          created_at: string
          id: string
          profile_id: string
          stars: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "syllabus_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      is_user_muted: { Args: { _user_id: string }; Returns: boolean }
      set_room_lock: {
        Args: {
          _creator: string
          _is_locked: boolean
          _max: number
          _pin: string
          _room_id: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          description: string | null
          emoji: string | null
          id: string
          is_locked: boolean
          is_permanent: boolean
          last_activity_at: string
          max_participants: number | null
          name: string
          pin_hash: string | null
        }
        SetofOptions: {
          from: "*"
          to: "ypt_rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_guest_profile: {
        Args: {
          _avatar_url?: string
          _device_id: string
          _display_name: string
          _target_category: string
        }
        Returns: {
          account_type: string
          avatar_url: string | null
          created_at: string
          device_id: string | null
          display_name: string
          id: string
          is_banned: boolean
          is_muted: boolean
          moderation_note: string | null
          muted_until: string | null
          onboarded_at: string | null
          target_category: string
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_room_pin: {
        Args: { _pin: string; _room_id: string }
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
