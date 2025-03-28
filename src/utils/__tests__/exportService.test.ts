import { exportToPDF, exportToCSV } from '@/utils/exportService';
import { createStandardBrowserClient } from '@/utils/supabase-client';

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

// Mock Blob for testing
const mockBlobContent = new Map<Blob, string>();

class MockBlob implements Blob {
  readonly size: number = 0;
  readonly type: string = '';
  private readonly _content: Uint8Array = new Uint8Array();

  constructor(content: BlobPart[] = [], _options?: BlobPropertyBag) {
    const contentString = content.map(part => String(part)).join('');
    mockBlobContent.set(this, contentString);
  }
  
  bytes(): Promise<Uint8Array> {
    return Promise.resolve(this._content);
  }

  text(): Promise<string> {
    return Promise.resolve(mockBlobContent.get(this) || '');
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }

  slice(_start?: number, _end?: number, _contentType?: string): Blob {
    return new MockBlob();
  }

  stream(): ReadableStream {
    return new ReadableStream();
  }
}

global.Blob = MockBlob as unknown as typeof Blob;

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

jest.mock('jspdf-autotable', () => jest.fn());

// Mock Supabase client
jest.mock('@/utils/supabase-client', () => ({
  createStandardBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => Promise.resolve(callback({
        data: null,
        error: null
      })))
    })
  }))
}));

describe('Export Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset Supabase mocks
    (createStandardBrowserClient as jest.Mock).mockClear();
    (createStandardBrowserClient as jest.Mock).mockImplementation(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null
        })
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({
          data: null,
          error: null
        })))
      })
    }));
  });

  const mockExpenses: Expense[] = [
    {
      id: '1',
      date: '2025-03-20',
      amount: 100,
      category_id: '1',
      location_id: '1',
      paid_by: 'User1',
      split_type: 'Equal',
      notes: 'Test notes',
      users: { name: 'User1' },
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      date: '2025-03-20',
      amount: 50,
      category_id: '1',
      location_id: '1',
      paid_by: 'User2',
      split_type: 'Equal',
      notes: 'Test notes 2',
      users: { name: 'User2' },
      created_at: new Date().toISOString()
    }
  ];

  describe('exportToCSV', () => {
    it('should create a CSV with expenses and settlement data', async () => {
      const result = await exportToCSV(mockExpenses, '2025-03');
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('fileName', 'expenses-2025-03.csv');
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should handle empty expenses array', async () => {
      await expect(exportToCSV([], '2025-03')).rejects.toThrow('No expenses to export');
    });

    it('should calculate settlements correctly', async () => {
      const result = await exportToCSV(mockExpenses, '2025-03');
      
      // Use modern Web APIs to read Blob content
      const csvContent = await result.data.text();
      
      // Verify settlements section exists
      expect(csvContent).toContain('Required Settlements');
      // Verify total amount
      expect(csvContent).toContain('£150.00'); // Total of both expenses
      // Verify average calculation
      expect(csvContent).toContain('£75.00'); // Average per user
    });
  });

  describe('exportToPDF', () => {
    it('should create a PDF with expenses and settlement data', async () => {
      const result = await exportToPDF(mockExpenses, '2025-03');
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('fileName', 'expenses-2025-03.pdf');
      expect(Buffer.isBuffer(result.data)).toBe(true);

      // Verify PDF generation calls
      expect(mockJsPDF.setFontSize).toHaveBeenCalled();
      // Verify that text was called with the title (more flexible assertion)
      expect(mockJsPDF.text).toHaveBeenCalled();
      const textCalls = mockJsPDF.text.mock.calls;
      const titleCallFound = textCalls.some(call => 
        typeof call[0] === 'string' && call[0].includes('AAFairShare')
      );
      expect(titleCallFound).toBe(true);
      expect(mockJsPDF.autoTable).toHaveBeenCalled();
    });

    it('should handle empty expenses array', async () => {
      await expect(exportToPDF([], '2025-03')).rejects.toThrow('No expenses to export');
    });

    it('should include settlement calculations in PDF', async () => {
      await exportToPDF(mockExpenses, '2025-03');

      // Verify settlements section
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        'Required Settlements',
        expect.any(Number),
        expect.any(Number)
      );

      // Verify total and average calculations
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('£150.00'),
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('£75.00'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});
