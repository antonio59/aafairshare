'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
// Improved for React 19 hydration - only import what we need

export interface ExportButtonProps {
  onExport: (format: 'csv' | 'pdf') => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ExportButton({ 
  onExport, 
  disabled = false,
  isLoading = false 
}: ExportButtonProps) {
  // Local state for tracking which format is being exported
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | null>(null);
  
  // Use parent-provided isLoading state if available, otherwise use local state
  const [localIsExporting, setLocalIsExporting] = useState(false);
  const isExporting = isLoading || localIsExporting;

  const handleExport = async (format: 'csv' | 'pdf') => {
    // Only manage local state if parent isn't controlling loading state
    if (!isLoading) {
      setLocalIsExporting(true);
    }
    setExportFormat(format);
    
    try {
      await onExport(format);
    } finally {
      // Only reset local state if parent isn't controlling loading state
      if (!isLoading) {
        setLocalIsExporting(false);
      }
      setExportFormat(null);
    }
  };

  // Using simpler button UI for React 19 compatibility instead of dropdown
  return (
    <div className="flex flex-row space-x-2">
      <Button 
        variant="outline" 
        className="min-w-[120px]" 
        disabled={disabled || isExporting || exportFormat === 'csv'}
        onClick={() => handleExport('csv')}
      >
        {isExporting && exportFormat === 'csv' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exporting CSV...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </>
        )}
      </Button>
      
      <Button 
        variant="outline" 
        className="min-w-[120px]" 
        disabled={disabled || isExporting || exportFormat === 'pdf'}
        onClick={() => handleExport('pdf')}
      >
        {isExporting && exportFormat === 'pdf' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exporting PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </>
        )}
      </Button>
    </div>
  );
}
