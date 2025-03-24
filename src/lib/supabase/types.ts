export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          date: string
          amount: number
          category_id: string
          location_id: string
          user_id: string
          split_type: 'equal' | 'percentage' | 'amount'
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          date: string
          amount: number
          category_id: string
          location_id: string
          user_id: string
          split_type: 'equal' | 'percentage' | 'amount'
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          date?: string
          amount?: number
          category_id?: string
          location_id?: string
          user_id?: string
          split_type?: 'equal' | 'percentage' | 'amount'
          notes?: string
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
        }
      }
      locations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
        }
      }
    }
  }
} 