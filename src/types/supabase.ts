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
          category: string
          created_at: string
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          category: string
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          category?: string
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      expense_locations: {
        Row: {
          id: string
          expense_id: string
          location_id: string
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          location_id: string
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          location_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_locations_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          amount: number
          date: string
          notes: string
          split_type: string | null
          created_at: string
          updated_at: string | null
          paid_by: string | null
          category_id: string | null
          location_id: string | null
        }
        Insert: {
          id?: string
          amount: number
          date: string
          notes: string
          split_type?: string | null
          created_at?: string
          updated_at?: string | null
          paid_by?: string | null
          category_id?: string | null
          location_id?: string | null
        }
        Update: {
          id?: string
          amount?: number
          date?: string
          notes?: string
          split_type?: string | null
          created_at?: string
          updated_at?: string | null
          paid_by?: string | null
          category_id?: string | null
          location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      exports: {
        Row: {
          id: string
          user_id: string
          data_type: string
          format: string
          filters: Json | null
          file_name: string | null
          file_data: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          data_type: string
          format: string
          filters?: Json | null
          file_name?: string | null
          file_data?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          data_type?: string
          format?: string
          filters?: Json | null
          file_name?: string | null
          file_data?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      locations: {
        Row: {
          id: string
          location: string
          created_at: string
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          location: string
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          location?: string
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          user_id: string
          report_type: string
          start_date: string | null
          end_date: string | null
          report_data: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          report_type: string
          start_date?: string | null
          end_date?: string | null
          report_data?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          report_type?: string
          start_date?: string | null
          end_date?: string | null
          report_data?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settlements: {
        Row: {
          id: string
          user_id: string | null
          month_year: string
          amount: number
          status: string
          created_at: string
          updated_at: string | null
          settled_at: string | null
          is_settled: boolean
          settled_date: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          month_year: string
          amount: number
          status?: string
          created_at?: string
          updated_at?: string | null
          settled_at?: string | null
          is_settled?: boolean
          settled_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          month_year?: string
          amount?: number
          status?: string
          created_at?: string
          updated_at?: string | null
          settled_at?: string | null
          is_settled?: boolean
          settled_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
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

// Define some common types for easier access
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Location = Database['public']['Tables']['locations']['Row']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type Settlement = Database['public']['Tables']['settlements']['Row']
export type SettlementInsert = Database['public']['Tables']['settlements']['Insert']
export type SettlementUpdate = Database['public']['Tables']['settlements']['Update']

export type User = Database['public']['Tables']['users']['Row']
