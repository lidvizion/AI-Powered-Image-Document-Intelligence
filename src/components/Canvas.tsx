'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { LidVizionResult } from '@/lib/lv';

interface CanvasProps {
  file: File | null;
  results: LidVizionResult | null;
  isProcessing: boolean;
}

export default function Canvas({ file, results, isProcessing }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setImageDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  const getClassColor = (className: string): string => {
    const colors: Record<string, string> = {
      lid: '#3B82F6',           // blue
      container: '#10B981',     // green
      plastic_container: '#10B981',
      metal_lid: '#6366F1',     // indigo
      bottle: '#8B5CF6',        // violet
      cap: '#EC4899',           // pink
      label: '#F59E0B',         // amber
      default: '#6B7280'        // gray
    };
    return colors[className] || colors.default;
  };

  const drawLabel = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) => {
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    const textMetrics = ctx.measureText(text);
    const labelPadding = 4;
    const labelHeight = 20;

    ctx.fillStyle = color;
    ctx.fillRect(x, y - labelHeight, textMetrics.width + labelPadding * 2, labelHeight);

    ctx.fillStyle = 'white';
    ctx.fillText(text, x + labelPadding, y - labelPadding);
  };

  const drawOverlays = useCallback((
    ctx: CanvasRenderingContext2D,
    results: {
      detections?: Array<{ id: string; class: string; score: number; box: number[] }>;
      instances?: Array<{ id: string; class: string; score: number; polygon: number[][] }>;
      labels?: Array<{ id: string; class: string; score: number; attributes?: Record<string, string> }>;
      blocks?: Array<{ id: string; text: string; score: number; box: number[] }>;
    },
    scaleX: number,
    scaleY: number
  ) => {
    // Draw detection boxes
    if (results.detections) {
      results.detections.forEach((detection) => {
        const [x, y, width, height] = detection.box;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        const color = getClassColor(detection.class);
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

        // Draw semi-transparent fill
        ctx.fillStyle = color + '20';
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

        // Draw label
        drawLabel(ctx, `${detection.class} (${Math.round(detection.score * 100)}%)`, scaledX, scaledY, color);
      });
    }

    // Draw instance polygons
    if (results.instances) {
      results.instances.forEach((instance) => {
        const color = getClassColor(instance.class);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = color + '15';
        
        ctx.beginPath();
        instance.polygon.forEach((point, index) => {
          const [x, y] = point;
          const scaledX = x * scaleX;
          const scaledY = y * scaleY;
          
          if (index === 0) {
            ctx.moveTo(scaledX, scaledY);
          } else {
            ctx.lineTo(scaledX, scaledY);
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw label at first point
        if (instance.polygon.length > 0) {
          const [firstX, firstY] = instance.polygon[0];
          drawLabel(ctx, `${instance.class} (${Math.round(instance.score * 100)}%)`, firstX * scaleX, firstY * scaleY, color);
        }
      });
    }

    // Draw OCR text blocks
    if (results.blocks) {
      results.blocks.forEach((block) => {
        const [x, y, width, height] = block.box;
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        const color = '#F59E0B'; // amber for OCR
        
        // Draw text box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        ctx.setLineDash([]);

        // Draw text background
        ctx.fillStyle = color + '30';
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

        // Draw extracted text
        ctx.fillStyle = color;
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(block.text).width;
        const textX = scaledX + (scaledWidth - textWidth) / 2;
        const textY = scaledY + scaledHeight / 2 + 4;
        ctx.fillText(block.text, textX, textY);
      });
    }
  }, [getClassColor, drawLabel]);

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          // Set canvas size to match image
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;

          // Scale down if too large
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          setImageDimensions({ width, height });

          // Clear and draw image
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Draw all overlays if available
          if (results?.results) {
            drawOverlays(ctx, results.results, width / img.width, height / img.height);
          }
        };
        img.onerror = () => setError('Failed to load image');
        img.src = e.target?.result as string;
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const maxWidth = 800;
          const maxHeight = 600;
          let { videoWidth: width, videoHeight: height } = video;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          setImageDimensions({ width, height });

          // Draw first frame
          video.currentTime = 0;
          video.onseeked = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(video, 0, 0, width, height);

            if (results?.results) {
              drawOverlays(ctx, results.results, width / video.videoWidth, height / video.videoHeight);
            }
          };
        };
        video.onerror = () => setError('Failed to load video');
        video.src = e.target?.result as string;
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  }, [file, results, drawOverlays]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-medium">Error loading media</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No media selected</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload an image or video to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Media Analysis
          </h3>
          {results?.results?.summary && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              {results.results.summary.totalDetections && <span>Detections: {results.results.summary.totalDetections}</span>}
              {results.results.summary.totalInstances && <span>Instances: {results.results.summary.totalInstances}</span>}
              {results.results.summary.totalLabels && <span>Labels: {results.results.summary.totalLabels}</span>}
              {results.results.summary.totalBlocks && <span>OCR: {results.results.summary.totalBlocks}</span>}
              <span>Processing: {results.results.summary.processingTime}ms</span>
            </div>
          )}
        </div>

        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
            style={{ maxHeight: '600px' }}
          />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Analyzing media...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {(results?.results?.detections || results?.results?.instances || results?.results?.blocks) && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {results.results.detections && (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-500 rounded mr-2"></div>
                <span>Detections ({results.results.detections.length})</span>
              </div>
            )}
            {results.results.instances && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2 opacity-30"></div>
                <span>Instances ({results.results.instances.length})</span>
              </div>
            )}
            {results.results.labels && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span>Labels ({results.results.labels.length})</span>
              </div>
            )}
            {results.results.blocks && (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-amber-500 border-dashed rounded mr-2"></div>
                <span>OCR ({results.results.blocks.length})</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
