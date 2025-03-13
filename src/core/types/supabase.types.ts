export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budget_settings: {
        Row: {
          created_at: string
          id: string
          monthly_target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          category: string
          created_at: string
          id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      expense_locations: {
        Row: {
          created_at: string | null
          expense_id: string
          id: string
          location_id: string
        }
        Insert: {
          created_at?: string | null
          expense_id: string
          id?: string
          location_id: string
        }
        Update: {
          created_at?: string | null
          expense_id?: string
          id?: string
          location_id?: string
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
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          id: string
          location_id: string | null
          notes: string | null
          paid_by: string | null
          split_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date: string
          id?: string
          location_id?: string | null
          notes?: string | null
          paid_by?: string | null
          split_type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          paid_by?: string | null
          split_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_expenses_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_expenses_location"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_paid_by"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          data_type: string
          file_data: string
          file_name: string
          filters: Json | null
          format: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_type: string
          file_data: string
          file_name: string
          filters?: Json | null
          format: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_type?: string
          file_data?: string
          file_name?: string
          filters?: Json | null
          format?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          location: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          end_date: string
          id: string
          report_data: Json
          report_type: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          report_data: Json
          report_type: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          report_data?: Json
          report_type?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          default_currency: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_currency?: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_currency?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          month_year: string
          settled_at: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          month_year: string
          settled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          month_year?: string
          settled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      column_exists: {
        Args: {
          table_name: string
          column_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
