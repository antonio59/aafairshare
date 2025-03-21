export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          amount: number;
          category_id: string;
          location_id: string | null;
          notes: string | null;
          date: string;
          paid_by: string;
          split_type: 'Equal' | 'No Split';
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          category_id: string;
          location_id?: string | null;
          notes?: string | null;
          date: string;
          paid_by: string;
          split_type?: 'Equal' | 'No Split';
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          category_id?: string;
          location_id?: string | null;
          notes?: string | null;
          date?: string;
          paid_by?: string;
          split_type?: 'Equal' | 'No Split';
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          location: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          location?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
      exports: {
        Row: {
          id: string;
          user_id: string;
          data_type: string;
          format: 'csv' | 'pdf';
          filters: Record<string, string | number | boolean | null>;
          file_data: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          data_type: string;
          format: 'csv' | 'pdf';
          filters: Record<string, string | number | boolean | null>;
          file_name: string;
          file_data: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          data_type?: string;
          format?: 'csv' | 'pdf';
          filters?: Record<string, string | number | boolean | null>;
          file_name?: string;
          file_data?: string;
          created_at?: string;
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];