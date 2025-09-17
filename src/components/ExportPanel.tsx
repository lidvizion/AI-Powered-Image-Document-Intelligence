'use client';

import { useState, useRef } from 'react';
import { LidVizionResult } from '@/lib/lv';

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  results: LidVizionResult | null;
  fileName?: string;
}

export default function ExportPanel({ canvasRef, results, fileName = 'analysis' }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'json'>('png');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [imageQuality, setImageQuality] = useState(0.9);

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    
    try {
      if (exportFormat === 'png') {
        await exportAsPNG();
      } else if (exportFormat === 'pdf') {
        await exportAsPDF();
      } else if (exportFormat === 'json') {
        await exportAsJSON();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPNG = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png', imageQuality);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${fileName}_analysis.png`;
    link.href = dataURL;
    link.click();
  };

  const exportAsPDF = async () => {
    if (!canvasRef.current || !results) return;

    // Dynamic import for PDF generation
        const { jsPDF } = await import('jspdf');
    
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL('image/png', imageQuality);
    
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit the image
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    // Add image
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

    // Add metadata if requested
    if (includeMetadata && results.results?.summary) {
      const summary = results.results.summary;
      pdf.setFontSize(10);
      pdf.text(`Analysis Results - ${new Date().toLocaleString()}`, 10, 10);
      pdf.text(`Detections: ${summary.totalDetections || 0}`, 10, 15);
      pdf.text(`Instances: ${summary.totalInstances || 0}`, 10, 20);
      pdf.text(`Labels: ${summary.totalLabels || 0}`, 10, 25);
      pdf.text(`OCR Blocks: ${summary.totalBlocks || 0}`, 10, 30);
      pdf.text(`Processing Time: ${summary.processingTime}ms`, 10, 35);
    }

    pdf.save(`${fileName}_analysis.pdf`);
  };

  const exportAsJSON = async () => {
    if (!results) return;

    const exportData = {
      metadata: {
        fileName,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      },
      results: results.results,
      logs: results.logs
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.download = `${fileName}_analysis.json`;
    link.href = URL.createObjectURL(dataBlob);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Export Analysis
        </h3>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'png', label: 'PNG Image', icon: '🖼️' },
              { value: 'pdf', label: 'PDF Report', icon: '📄' },
              { value: 'json', label: 'JSON Data', icon: '📊' }
            ].map((format) => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value as 'png' | 'pdf' | 'json')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportFormat === format.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{format.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {format.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        {exportFormat === 'png' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Quality: {Math.round(imageQuality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={imageQuality}
                onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {exportFormat === 'pdf' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMetadata"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeMetadata" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Include analysis metadata
              </label>
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export {exportFormat.toUpperCase()}</span>
            </>
          )}
        </button>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setExportFormat('png');
                handleExport();
              }}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span>🖼️</span>
              <span>Quick PNG</span>
            </button>
              <button
                onClick={() => {
                  setExportFormat('json');
                  handleExport();
                }}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span>📊</span>
              <span>Quick JSON</span>
            </button>
          </div>
        </div>
      </div>

      <a ref={downloadRef} className="hidden" />
    </div>
  );
}
