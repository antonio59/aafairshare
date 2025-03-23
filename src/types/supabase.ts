export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          amount: number;
          date: string;
          paid_by: string;
          created_at: string;
          updated_at?: string;
          split_type: string;
          category_id?: string;
          description?: string;
          location_id?: string;
        };
        Insert: {
          id?: string;
          amount: number;
          date: string;
          paid_by: string;
          created_at?: string;
          updated_at?: string;
          split_type: string;
          category_id?: string;
          description?: string;
          location_id?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          date?: string;
          paid_by?: string;
          created_at?: string;
          updated_at?: string;
          split_type?: string;
          category_id?: string;
          description?: string;
          location_id?: string;
        };
      };
      settlements: {
        Row: {
          id: string;
          from: string;
          to: string;
          amount: number;
          month: string;
          status: 'pending' | 'completed';
          created_at: string;
          updated_at?: string;
          is_settled?: boolean;
          month_year?: string;
          user_id?: string;
          split_type?: string;
        };
        Insert: {
          id?: string;
          from: string;
          to: string;
          amount: number;
          month: string;
          status?: 'pending' | 'completed';
          created_at?: string;
          updated_at?: string;
          is_settled?: boolean;
          month_year?: string;
          user_id?: string;
          split_type?: string;
        };
        Update: {
          id?: string;
          from?: string;
          to?: string;
          amount?: number;
          month?: string;
          status?: 'pending' | 'completed';
          created_at?: string;
          updated_at?: string;
          is_settled?: boolean;
          month_year?: string;
          user_id?: string;
          split_type?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          language?: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          language?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          language?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};