'use client';

import { useState, useCallback, useRef } from 'react';
import Upload from '@/components/Upload';
import Canvas from '@/components/Canvas';
import ResultsPanel from '@/components/ResultsPanel';
import RunButton from '@/components/RunButton';
import LogTray from '@/components/LogTray';
import ExportPanel from '@/components/ExportPanel';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useNotification } from '@/components/Notification';
import ComparisonMode from '@/components/ComparisonMode';
import { runJob, LidVizionResult, isLive } from '@/lib/lv';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<LidVizionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{
    fileName: string;
    fileSize: number;
    fileType: string;
    mediaType: string;
    timestamp: string;
  } | null>(null);
  const [resultsHistory, setResultsHistory] = useState<LidVizionResult[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const { addNotification, NotificationContainer } = useNotification();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResults(null);
    setError(null);
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create FormData for the request
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'video');

      // Store request data for log tray
      setRequestData({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        mediaType: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        timestamp: new Date().toISOString()
      });

      const result = await runJob(formData);
      setResults(result);
      setResultsHistory(prev => [...prev, result]);
      addNotification('success', 'Analysis completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      addNotification('error', `Analysis failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, addNotification]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setRequestData(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Lid Vizion
                </h1>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI-Powered Object Detection</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-3 py-2 bg-white/50 dark:bg-gray-700/50 rounded-full border border-gray-200/50 dark:border-gray-600/50">
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'} shadow-sm`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isLive ? 'Live API' : 'Demo Mode'}
                </span>
              </div>

              {resultsHistory.length > 1 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="group px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transform hover:scale-105"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Compare ({resultsHistory.length})</span>
                  </span>
                </button>
              )}

              {selectedFile && (
                <button
                  onClick={handleReset}
                  className="group px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transform hover:scale-105"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reset</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <section className="relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
                Upload Your Media
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Upload an image or video to detect and analyze lids and containers using our AI-powered vision system.
              </p>
            </div>

            <div className="relative">
              <Upload onFileSelect={handleFileSelect} disabled={isProcessing} />
            </div>

            {selectedFile && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg">{selectedFile.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <RunButton
                      onRun={handleRunAnalysis}
                      isProcessing={isProcessing}
                      hasFile={!!selectedFile}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Processing Indicator */}
          {isProcessing && (
            <section>
              <ProgressIndicator isProcessing={isProcessing} />
            </section>
          )}

          {/* Analysis Section */}
          {(selectedFile || results || isProcessing) && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Canvas */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Media Preview & Detections
                </h3>
                <Canvas 
                  ref={canvasRef}
                  file={selectedFile} 
                  results={results} 
                  isProcessing={isProcessing} 
                />
              </div>

              {/* Results and Export */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Analysis Results
                  </h3>
                  <ResultsPanel 
                    results={results} 
                    isProcessing={isProcessing} 
                    error={error} 
                  />
                </div>

                {/* Export Panel */}
                {results && (
                  <ExportPanel 
                    canvasRef={canvasRef}
                    results={results}
                    fileName={selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'analysis'}
                  />
                )}
              </div>
            </section>
          )}

          {/* Info Section */}
          {!selectedFile && !results && !isProcessing && (
            <section className="text-center py-16">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    How It Works
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Our AI-powered system makes object detection simple and accurate
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group flex flex-col items-center text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-xl">1. Upload</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Upload your image or video containing lids and containers using our intuitive drag-and-drop interface
                    </p>
                  </div>

                  <div className="group flex flex-col items-center text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-xl">2. Analyze</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Our advanced AI processes your media to detect and classify objects with high accuracy
                    </p>
                  </div>

                  <div className="group flex flex-col items-center text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-xl">3. Results</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      View detailed detection results with bounding boxes, confidence scores, and export options
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                © 2024 Lid Vizion Demo. Built with Next.js 14 & TypeScript.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {isLive ? 'Production Mode' : 'Simulation Mode'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Log Tray */}
      <LogTray 
        results={results} 
        requestData={requestData} 
        isProcessing={isProcessing} 
      />

      {/* Notifications */}
      <NotificationContainer />

      {/* Comparison Mode */}
      {showComparison && (
        <ComparisonMode 
          results={resultsHistory}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}