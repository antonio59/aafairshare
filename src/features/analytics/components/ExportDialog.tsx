import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { AnalyticsExportData, ExportOptions } from '../api/exportService';
import { createCSVContent, createPDFDocument, exportAnalyticsToCSV, exportAnalyticsToPDF } from '../api/exportService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalyticsExportData;
  formatAmount: (amount: number) => string;
}

export function ExportDialog({ isOpen, onClose, data, formatAmount }: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    dateRange: data.dateRange,
    includeSections: {
      summary: true,
      categories: true,
      locations: true,
      trends: true
    }
  });
  const [previewContent, setPreviewContent] = useState<string>('');

  // Update preview when options change
  const updatePreview = async () => {
    try {
      if (format === 'pdf') {
        const pdfUrl = await exportAnalyticsToPDF(data, formatAmount, options, true) as string;
        setPreviewContent(pdfUrl);
      } else {
        const csvContent = await exportAnalyticsToCSV(data, formatAmount, options, true) as string;
        setPreviewContent(csvContent);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  // Handle section toggle
  const toggleSection = (section: keyof NonNullable<ExportOptions['includeSections']>) => {
    setOptions((prev: ExportOptions) => ({
      ...prev,
      includeSections: {
        ...prev.includeSections,
        [section]: !prev.includeSections?.[section]
      }
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      setLoading(true);
      if (format === 'pdf') {
        await exportAnalyticsToPDF(data, formatAmount, options);
      } else {
        await exportAnalyticsToCSV(data, formatAmount, options);
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update preview when format or options change
  useEffect(() => {
    updatePreview();
  }, [format, options]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Preview and customize your analytics report before exporting
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[250px_1fr] gap-4 h-full">
          {/* Options Panel */}
          <div className="space-y-4 border-r pr-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <TabsList className="w-full">
                <TabsTrigger
                  value="pdf"
                  className="flex-1"
                  onClick={() => setFormat('pdf')}
                >
                  PDF
                </TabsTrigger>
                <TabsTrigger
                  value="csv"
                  className="flex-1"
                  onClick={() => setFormat('csv')}
                >
                  CSV
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="space-y-2">
              <Label>Included Sections</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summary"
                    checked={options.includeSections?.summary}
                    onCheckedChange={() => toggleSection('summary')}
                  />
                  <Label htmlFor="summary">Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="categories"
                    checked={options.includeSections?.categories}
                    onCheckedChange={() => toggleSection('categories')}
                  />
                  <Label htmlFor="categories">Categories</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="locations"
                    checked={options.includeSections?.locations}
                    onCheckedChange={() => toggleSection('locations')}
                  />
                  <Label htmlFor="locations">Locations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trends"
                    checked={options.includeSections?.trends}
                    onCheckedChange={() => toggleSection('trends')}
                  />
                  <Label htmlFor="trends">Trends</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="h-full">
            <ScrollArea className="h-full rounded-md border">
              {format === 'pdf' ? (
                previewContent ? (
                  <iframe
                    src={previewContent}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    Loading preview...
                  </div>
                )
              ) : (
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                  {previewContent}
                </pre>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}