import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  location_id: string;
  notes: string;
  date: string;
  paid_by: string;
  split_type: 'Equal' | 'No Split';
  users: {
    name: string;
  }
  created_at: string;
}

export interface ExportData {
  expenses: Expense[];
  month: string;
  totalExpenses?: number;
}

export const getSupabaseData = async () => {
  const supabase = createClientComponentClient();
  const { data: categories } = await supabase.from('categories').select('id, category');
  const { data: locations } = await supabase.from('locations').select('id, location');

  return {
    categoryMap: new Map(categories?.map(c => [c.id, c.category]) || []),
    locationMap: new Map(locations?.map(l => [l.id, l.location]) || [])
  };
};

export const recordExport = async (params: {
  format: 'csv' | 'pdf';
  month: string;
  fileName: string;
  fileData: string;
}) => {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('exports').insert({
    user_id: user?.id,
    data_type: 'expenses',
    format: params.format,
    filters: { month: params.month },
    file_name: params.fileName,
    file_data: params.fileData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};