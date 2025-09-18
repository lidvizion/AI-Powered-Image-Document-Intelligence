"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { isLive, runJob } from "@/lib/lv";

type OCRBox = [number, number, number, number];
type OCRBlock = { text: string; box: OCRBox };
type OCRResponse = { blocks?: OCRBlock[] };

// If your file is /sample/receipt1.jpg, switch this.
const SAMPLE_PATH = "/sample/receipt1.png";

/* util: download an object as pretty JSON */
function downloadJSON(data: unknown, filename = "ocr-result.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");
  const [showLogs, setShowLogs] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // overlay controls
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  // Default: collapse logs on small screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowLogs(false);
    }
  }, []);

  const reset = () => {
    setImgUrl(null);
    setResult(null);
    setLog("");
    setNatural(null);
    setMsg(null);
  };

  const pickSample = () => {
    setImgUrl(SAMPLE_PATH);
    setResult(null);
    setLog("");
    setMsg(null);
  };

  const onFile = (f: File | undefined | null) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    setResult(null);
    setLog("");
    setMsg(null);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => onFile(e.target.files?.[0]);

  // Drag & drop
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onRun = async () => {
    if (!imgUrl) return;
    setLoading(true);
    setResult(null);
    setMsg(null);
    try {
      const r = (await runJob({ task: "ocr" })) as OCRResponse;
      setResult(r);
      setLog(JSON.stringify(r, null, 2));
      if (!r?.blocks?.length) setMsg("No text blocks found in the mock response.");
    } catch (e: any) {
      setMsg(`Error: ${String(e?.message || e)}`);
    } finally {
      setLoading(false);
    }
  };

  const onExport = () => {
    if (!result) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJSON(result, `ocr-result-${ts}.json`);
  };

  const boxes = useMemo(() => {
    if (!result?.blocks || !imgRef.current || !natural) return [];
    const dw = imgRef.current.clientWidth || natural.w;
    const dh = imgRef.current.clientHeight || natural.h;
    const sx = dw / natural.w;
    const sy = dh / natural.h;
    return result.blocks.map((b) => {
      const [x1, y1, x2, y2] = b.box;
      return {
        left: Math.round(x1 * sx),
        top: Math.round(y1 * sy),
        width: Math.round((x2 - x1) * sx),
        height: Math.round((y2 - y1) * sy),
        text: b.text,
      };
    });
  }, [result, natural]);

  const canRun = !!imgUrl && !loading;
  const canExport = !!result;

  // derive a friendly file label
  const fileLabel = imgUrl?.startsWith("blob:")
    ? "Uploaded image"
    : imgUrl?.split("/").slice(-1)[0] || "No file";

  // shared card style
  const card = "rounded-xl border border-neutral-800 bg-neutral-900/40 shadow-[0_0_0_1px_rgba(255,255,255,.04)_inset]";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/lv-logo.svg" alt="Lid Vizion" className="w-8 h-8 rounded object-contain" />
            <h1 className="text-2xl font-extrabold tracking-tight">
              Lid Vizion — OCR Template <span className="text-neutral-400 font-semibold">(Sim)</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-1 rounded-full bg-neutral-800/80 border border-neutral-700">
              Mode:{" "}
              <strong className={isLive ? "text-green-400" : "text-yellow-300"}>
                {isLive ? "LIVE" : "SIMULATION"}
              </strong>
            </span>
            <button
              onClick={reset}
              className="px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Clear image and results"
              aria-label="Reset"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Message banner & a11y status */}
        <div className="sr-only" aria-live="polite">
          {loading ? "Running analysis…" : result ? "Analysis complete" : ""}
        </div>
        {msg && (
          <div className="mb-4 rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-3 py-2 text-sm text-yellow-200">
            {msg}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 cursor-pointer border border-neutral-700 focus-within:ring-2 focus-within:ring-blue-500">
            <input type="file" accept="image/*" className="hidden" onChange={onInput} aria-label="Upload image" />
            Upload image
          </label>

          <button
            onClick={pickSample}
            className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Use sample
          </button>

          <button
            disabled={!canRun}
            onClick={onRun}
            className={`px-4 py-2 rounded font-medium inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              canRun ? "bg-blue-600 hover:bg-blue-500" : "bg-neutral-800 opacity-50 cursor-not-allowed"
            }`}
            aria-busy={loading}
            title="Run OCR"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8v4" fill="currentColor" />
              </svg>
            )}
            {loading ? "Running…" : "Run"}
          </button>

          {imgUrl && (
            <span
              className="ml-auto text-xs px-2 py-1 rounded border border-neutral-800 bg-neutral-900/60 text-neutral-400 max-w-[160px] truncate"
              title={fileLabel}
            >
              {fileLabel}
            </span>
          )}
        </div>

        {/* Overlay controls */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-neutral-400">Overlays:</span>
          <button
            onClick={() => setShowBoxes((v) => !v)}
            role="switch"
            aria-checked={showBoxes}
            className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showBoxes ? "bg-neutral-800 border-neutral-600" : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
            title="Toggle boxes"
          >
            Boxes
          </button>
          <button
            onClick={() => setShowLabels((v) => !v)}
            role="switch"
            aria-checked={showLabels}
            className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showLabels ? "bg-neutral-800 border-neutral-600" : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
            title="Toggle labels"
          >
            Labels
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Dropzone + Preview */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`${card} relative w-full p-3 ${dragActive ? "border-blue-500" : ""}`}
            aria-label="Preview area"
            tabIndex={0}
          >
            {imgUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imgUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border border-neutral-800"
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setNatural({ w: el.naturalWidth, h: el.naturalHeight });
                  }}
                />
                {/* Overlays */}
                {(showBoxes || showLabels) && (
                  <div className="pointer-events-none absolute inset-0">
                    {boxes.map((b, i) => (
                      <div key={i}>
                        {showBoxes && (
                          <div
                            style={{
                              position: "absolute",
                              left: b.left,
                              top: b.top,
                              width: b.width,
                              height: b.height,
                              border: "2px solid #60a5fa",
                              borderRadius: 6,
                              boxShadow: "0 0 0 1px rgba(96,165,250,.3) inset",
                            }}
                            title={b.text}
                          />
                        )}
                        {showLabels && (
                          <div
                            style={{
                              position: "absolute",
                              left: b.left,
                              top: Math.max(0, b.top - 22),
                              padding: "2px 6px",
                              fontSize: 12,
                              background: "rgba(17,24,39,.9)",
                              color: "#e5e7eb",
                              border: "1px solid rgba(96,165,250,.35)",
                              borderRadius: 6,
                              transform: "translateY(-2px)",
                              maxWidth: "75%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={b.text}
                          >
                            {b.text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 rounded-lg border border-dashed grid place-items-center text-neutral-400">
                <div className="text-center">
                  <p className="font-medium">Drag & drop an image</p>
                  <p className="text-xs mt-1">or click “Upload image” / “Use sample”</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Results / Logs */}
          <div className={`${card} p-3`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Results</h2>
              <div className="flex items-center gap-2">
                <button
                  disabled={!canExport}
                  onClick={onExport}
                  className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    canExport
                      ? "bg-blue-600 hover:bg-blue-500 border-blue-500"
                      : "bg-neutral-800 opacity-50 cursor-not-allowed border-neutral-700"
                  }`}
                  title="Download current result as JSON"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => setShowLogs((v) => !v)}
                  className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {showLogs ? "Hide logs" : "Show logs"}
                </button>
              </div>
            </div>

            {showLogs && (
              <pre className="bg-neutral-950 text-neutral-300 text-xs p-3 rounded-lg min-h-[240px] md:min-h-[360px] max-h-[480px] overflow-auto">
{log || "// Run to see mock response"}
              </pre>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
