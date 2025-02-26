'use client';

import * as React from 'react';
import { Download, FileJson, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { toast } from './use-toast';
import { cn } from '@/lib/utils';

interface ExportData {
  data: unknown[];
  filename?: string;
  title?: string;
  description?: string;
}

interface ExportButtonProps {
  data: ExportData;
  onExport?: (format: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const EXPORT_FORMATS = {
  json: {
    label: 'JSON',
    icon: FileJson,
    mimeType: 'application/json',
    extension: '.json'
  },
  excel: {
    label: 'Excel',
    icon: FileSpreadsheet,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx'
  },
  pdf: {
    label: 'PDF',
    icon: File,
    mimeType: 'application/pdf',
    extension: '.pdf'
  }
} as const;

export function ExportButton({
  data,
  onExport,
  className,
  disabled
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<keyof typeof EXPORT_FORMATS | null>(null);

  const handleExport = async (format: keyof typeof EXPORT_FORMATS) => {
    if (isExporting || !data.data.length) return;

    setIsExporting(true);
    setExportFormat(format);

    try {
      if (onExport) {
        await onExport(format);
      } else {
        const filename = data.filename || `export-${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'json') {
          // Handle JSON export directly
          const dataStr = JSON.stringify(data.data, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          downloadBlob(blob, `${filename}.json`);
        } else {
          // Dynamically import export utilities
          const { exportToPDF, exportToExcel } = await import('@/lib/export-utils');
          
          if (format === 'pdf') {
            exportToPDF({
              columns: [{ header: 'Data', key: 'data', width: 100 }],
              data: data.data,
              title: data.title || 'Export',
              subtitle: data.description,
              filename: `${filename}.pdf`
            });
          } else if (format === 'excel') {
            exportToExcel({
              columns: [{ header: 'Data', key: 'data', width: 100 }],
              data: data.data,
              title: data.title || 'Export',
              subtitle: data.description,
              filename: `${filename}.xlsx`
            });
          }
        }
      }

      toast({
        title: 'Export Successful',
        description: `Your data has been exported as ${EXPORT_FORMATS[format].label}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const isDisabled = disabled || !data.data.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'flex items-center gap-2',
            isDisabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={isDisabled}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(EXPORT_FORMATS).map(([format, { label, icon: Icon }]) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format as keyof typeof EXPORT_FORMATS)}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>Export as {label}</span>
            {isExporting && exportFormat === format && (
              <Loader2 className="h-4 w-4 animate-spin ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
