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
      budget_settings: {
        Row: {
          id: string
          user_id: string
          monthly_target: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          monthly_target?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          monthly_target?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
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
          split_type: string
          created_at: string
          updated_at: string
          paid_by: string
          category_id: string
          location_id: string
        }
        Insert: {
          id?: string
          amount: number
          date: string
          notes?: string
          split_type?: string
          created_at?: string
          updated_at?: string
          paid_by: string
          category_id: string
          location_id?: string
        }
        Update: {
          id?: string
          amount?: number
          date?: string
          notes?: string
          split_type?: string
          created_at?: string
          updated_at?: string
          paid_by?: string
          category_id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
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
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_locations_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          location?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          report_type: string
          start_date: string
          end_date: string
          report_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_type: string
          start_date: string
          end_date: string
          report_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_type?: string
          start_date?: string
          end_date?: string
          report_data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
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
          filters: Json
          file_name: string
          file_data: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_type: string
          format: string
          filters?: Json
          file_name: string
          file_data: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data_type?: string
          format?: string
          filters?: Json
          file_name?: string
          file_data?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          default_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settlements: {
        Row: {
          id: string
          user_id: string
          month_year: string
          amount: number
          status: string
          created_at: string
          updated_at: string
          settled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          month_year: string
          amount: number
          status?: string
          created_at?: string
          updated_at?: string
          settled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          month_year?: string
          amount?: number
          status?: string
          created_at?: string
          updated_at?: string
          settled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
          language: string
          preferences: Json
        }
        Insert: {
          id: string
          name?: string
          email: string
          created_at?: string
          updated_at?: string
          language?: string
          preferences?: Json
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
          language?: string
          preferences?: Json
        }
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
  }
}
