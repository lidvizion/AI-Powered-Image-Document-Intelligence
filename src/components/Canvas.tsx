'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { LidVizionResult } from '@/lib/lv';

interface CanvasProps {
  file: File | null;
  results: LidVizionResult | null;
  isProcessing: boolean;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ file, results }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [, setImageDimensions] = useState({ width: 0, height: 0 });
    const [error, setError] = useState<string | null>(null);
    const [zoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showOverlays, setShowOverlays] = useState({
      detections: true,
      instances: true,
      labels: true,
      ocr: true,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(
      null
    );

    // Expose ref
    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);

    // Helpers
    const getClassColor = (className: string): string => {
      const colors: Record<string, string> = {
        lid: '#3B82F6', // blue
        container: '#10B981', // green
        plastic_container: '#10B981',
        metal_lid: '#6366F1', // indigo
        bottle: '#8B5CF6', // violet
        cap: '#EC4899', // pink
        label: '#F59E0B', // amber
        default: '#6B7280', // gray
      };
      return colors[className] || colors.default;
    };

    const withAlpha = (hex: string, alpha: number): string => {
      // convert hex (#RRGGBB) to rgba()
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const drawLabel = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      color: string
    ) => {
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx.measureText(text);
      const labelPadding = 4;
      const labelHeight = 20;

      ctx.fillStyle = color;
      ctx.fillRect(
        x,
        y - labelHeight,
        textMetrics.width + labelPadding * 2,
        labelHeight
      );

      ctx.fillStyle = 'white';
      ctx.fillText(text, x + labelPadding, y - labelPadding);
    };

    const drawOverlays = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        results: {
          detections?: Array<{
            id: string;
            class: string;
            score: number;
            box: number[];
          }>;
          instances?: Array<{
            id: string;
            class: string;
            score: number;
            polygon: number[][];
          }>;
          labels?: Array<{
            id: string;
            class: string;
            score: number;
            attributes?: Record<string, string>;
          }>;
          blocks?: Array<{
            id: string;
            text: string;
            score: number;
            box: number[];
          }>;
        },
        scaleX: number,
        scaleY: number
      ) => {
        // Draw detection boxes
        if (results.detections && showOverlays.detections) {
          results.detections.forEach((detection) => {
            const [x, y, width, height] = detection.box;
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;

            const color = getClassColor(detection.class);

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

            ctx.fillStyle = withAlpha(color, 0.2);
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

            drawLabel(
              ctx,
              `${detection.class} (${Math.round(detection.score * 100)}%)`,
              scaledX,
              scaledY,
              color
            );
          });
        }

        // Draw instance polygons
        if (results.instances && showOverlays.instances) {
          results.instances.forEach((instance) => {
            const color = getClassColor(instance.class);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.fillStyle = withAlpha(color, 0.15);

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

            if (instance.polygon.length > 0) {
              const [firstX, firstY] = instance.polygon[0];
              drawLabel(
                ctx,
                `${instance.class} (${Math.round(instance.score * 100)}%)`,
                firstX * scaleX,
                firstY * scaleY,
                color
              );
            }
          });
        }

        // Draw OCR blocks
        if (results.blocks && showOverlays.ocr) {
          results.blocks.forEach((block) => {
            const [x, y, width, height] = block.box;
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;

            const color = '#F59E0B';

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            ctx.setLineDash([]);

            ctx.fillStyle = withAlpha(color, 0.3);
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

            ctx.fillStyle = color;
            ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
            const textWidth = ctx.measureText(block.text).width;
            const textX = scaledX + (scaledWidth - textWidth) / 2;
            const textY = scaledY + scaledHeight / 2 + 4;
            ctx.fillText(block.text, textX, textY);
          });
        }
      },
      [showOverlays]
    );

    // Touch events
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setLastTouch({ x: touch.clientX, y: touch.clientY });
        setIsDragging(true);
      }
    }, []);

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        if (e.touches.length === 1 && lastTouch && isDragging) {
          const touch = e.touches[0];
          const deltaX = touch.clientX - lastTouch.x;
          const deltaY = touch.clientY - lastTouch.y;

          setPan((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));

          setLastTouch({ x: touch.clientX, y: touch.clientY });
        }
      },
      [lastTouch, isDragging]
    );

    const handleTouchEnd = useCallback(() => {
      setIsDragging(false);
      setLastTouch(null);
    }, []);

    // Mouse events
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      setIsDragging(true);
      setLastTouch({ x: e.clientX, y: e.clientY });
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (isDragging && lastTouch) {
          const deltaX = e.clientX - lastTouch.x;
          const deltaY = e.clientY - lastTouch.y;

          setPan((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));

          setLastTouch({ x: e.clientX, y: e.clientY });
        }
      },
      [isDragging, lastTouch]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setLastTouch(null);
    }, []);

    // Draw image/video + overlays
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
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            setImageDimensions({ width, height });

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            if (results?.results) {
              drawOverlays(
                ctx,
                results.results,
                width / img.width,
                height / img.height
              );
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

            video.currentTime = 0;
            video.onseeked = () => {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(video, 0, 0, width, height);

              if (results?.results) {
                drawOverlays(
                  ctx,
                  results.results,
                  width / video.videoWidth,
                  height / video.videoHeight
                );
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

    // --- Render ---
    if (error) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-red-600 dark:text-red-400 font-medium">
              Error loading media
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      );
    }

    if (!file) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              No media selected
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Upload an image or video to get started
            </p>
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
                {results.results.summary.totalDetections && (
                  <span>Detections: {results.results.summary.totalDetections}</span>
                )}
                {results.results.summary.totalInstances && (
                  <span>Instances: {results.results.summary.totalInstances}</span>
                )}
                {results.results.summary.totalLabels && (
                  <span>Labels: {results.results.summary.totalLabels}</span>
                )}
                {results.results.summary.totalBlocks && (
                  <span>OCR: {results.results.summary.totalBlocks}</span>
                )}
                <span>
                  Processing: {results.results.summary.processingTime}ms
                </span>
              </div>
            )}
          </div>

          {/* Overlay toggles */}
          {results && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Overlays:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      { key: 'detections', label: 'Detections' },
                      { key: 'instances', label: 'Instances' },
                      { key: 'ocr', label: 'OCR' },
                    ].map((overlay) => (
                      <label
                        key={overlay.key}
                        className="flex items-center space-x-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={
                            showOverlays[overlay.key as keyof typeof showOverlays]
                          }
                          onChange={(e) =>
                            setShowOverlays((prev) => ({
                              ...prev,
                              [overlay.key]: e.target.checked,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            showOverlays[
                              overlay.key as keyof typeof showOverlays
                            ]
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                          }`}
                        >
                          {showOverlays[
                            overlay.key as keyof typeof showOverlays
                          ] && (
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {overlay.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto touch-none select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;
