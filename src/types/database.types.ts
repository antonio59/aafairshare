export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          color: string | null
          icon: string | null
          created_at: string
          category_group_id: string | null
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string
          category_group_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string
          category_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_category_group_id_fkey"
            columns: ["category_group_id"]
            referencedRelation: "category_groups"
            referencedColumns: ["id"]
          }
        ]
      }
      category_groups: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          date: string
          created_at: string
          updated_at: string | null
          paid_by: string
          split: Json
          category_id: string | null
          tags: string[] | null
          notes: string | null
          recurring: boolean
          recurring_frequency: string | null
          receipt_url: string | null
        }
        Insert: {
          id?: string
          description: string
          amount: number
          date: string
          created_at?: string
          updated_at?: string | null
          paid_by: string
          split?: Json
          category_id?: string | null
          tags?: string[] | null
          notes?: string | null
          recurring?: boolean
          recurring_frequency?: string | null
          receipt_url?: string | null
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          date?: string
          created_at?: string
          updated_at?: string | null
          paid_by?: string
          split?: Json
          category_id?: string | null
          tags?: string[] | null
          notes?: string | null
          recurring?: boolean
          recurring_frequency?: string | null
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      recurring_expenses: {
        Row: {
          id: string
          description: string | null
          amount: number
          category_id: string | null
          paid_by: string
          split: Json
          start_date: string
          frequency: string
          day_of_month: number
          tags: string[] | null
          last_processed: string | null
          next_due_date: string | null
          created_at: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          description?: string | null
          amount: number
          category_id?: string | null
          paid_by: string
          split?: Json
          start_date: string
          frequency: string
          day_of_month: number
          tags?: string[] | null
          last_processed?: string | null
          next_due_date?: string | null
          created_at?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          description?: string | null
          amount?: number
          category_id?: string | null
          paid_by?: string
          split?: Json
          start_date?: string
          frequency?: string
          day_of_month?: number
          tags?: string[] | null
          last_processed?: string | null
          next_due_date?: string | null
          created_at?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_expenses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settlements: {
        Row: {
          id: string
          amount: number
          date: string
          description: string
          created_at: string
          payer: string
          receiver: string
          status: string
        }
        Insert: {
          id?: string
          amount: number
          date: string
          description: string
          created_at?: string
          payer: string
          receiver: string
          status?: string
        }
        Update: {
          id?: string
          amount?: number
          date?: string
          description?: string
          created_at?: string
          payer?: string
          receiver?: string
          status?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          notification_preferences: Json | null
          theme: string | null
          language: string | null
          timezone: string | null
          created_at: string
          updated_at: string | null
          email_verified: boolean
          last_login: string | null
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          notification_preferences?: Json | null
          theme?: string | null
          language?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string | null
          email_verified?: boolean
          last_login?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          notification_preferences?: Json | null
          theme?: string | null
          language?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string | null
          email_verified?: boolean
          last_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          type: string
          userId: string | null
          action: string
          details: Json
          ipAddress: string | null
          userAgent: string | null
          timestamp: string
          severity: string | null
          source: string | null
          correlationId: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          userId?: string | null
          action: string
          details: Json
          ipAddress?: string | null
          userAgent?: string | null
          timestamp: string
          severity?: string | null
          source?: string | null
          correlationId?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          userId?: string | null
          action?: string
          details?: Json
          ipAddress?: string | null
          userAgent?: string | null
          timestamp?: string
          severity?: string | null
          source?: string | null
          correlationId?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      security_alerts: {
        Row: {
          id: string
          user_id: string | null
          type: string
          severity: string
          message: string
          details: Json | null
          timestamp: string
          created_at: string
          updated_at: string | null
          status: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          severity: string
          message: string
          details?: Json | null
          timestamp: string
          created_at?: string
          updated_at?: string | null
          status?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          severity?: string
          message?: string
          details?: Json | null
          timestamp?: string
          created_at?: string
          updated_at?: string | null
          status?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
