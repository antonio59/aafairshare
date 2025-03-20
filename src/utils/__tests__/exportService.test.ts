import { exportToPDF } from '@/utils/exportService';
import jsPDF from 'jspdf';

interface Expense {
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

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

// Mock jsPDF implementation
const mockJsPDF = {
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  text: jest.fn(),
  autoTable: jest.fn(),
  save: jest.fn(),
  output: jest.fn().mockReturnValue('mock-pdf-data'),
  lastAutoTable: { finalY: 100 },
  internal: {
    pageSize: {
      width: 595.28,
      height: 841.89,
      getWidth: () => 595.28,
      getHeight: () => 841.89
    }
  }
};

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn(() => mockJsPDF)
}));

jest.mock('jspdf-autotable');

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          { id: '1', category: 'Food' },
          { id: '2', category: 'Transport' }
        ]
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null })
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      })
    }
  }))
}));

describe('exportService', () => {
  describe('exportToPDF', () => {
    it('should create a PDF with expenses data', async () => {
      const expenses: Expense[] = [
        {
          id: '1',
          date: '2025-03-20',
          amount: 100,
          category_id: '1',
          location_id: '1',
          paid_by: 'User1',
          split_type: 'Equal',
          notes: 'Test notes',
          users: {
            name: 'User1'
          },
          created_at: new Date().toISOString()
        }
      ];

      const settlement: Settlement = {
        from: 'User2',
        to: 'User1',
        amount: 50
      };

      const month = '2025-03';
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const result = await exportToPDF(expenses, month, totalExpenses, settlement);

      expect(result).toBeDefined();
      expect(jsPDF).toHaveBeenCalled();
      expect(mockJsPDF.autoTable).toHaveBeenCalled();
      expect(mockJsPDF.output).toHaveBeenCalled();
    });
  });
});
