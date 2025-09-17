'use client';

import { useState, useCallback } from 'react';
import Upload from '@/components/Upload';
import Canvas from '@/components/Canvas';
import ResultsPanel from '@/components/ResultsPanel';
import RunButton from '@/components/RunButton';
import LogTray from '@/components/LogTray';
import { runJob, LidVizionResult, isLive } from '@/lib/lv';

export default function Home() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setRequestData(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Lid Vizion</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Object Detection</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isLive ? 'Live API' : 'Demo Mode'}
                </span>
              </div>

              {selectedFile && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
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
          <section>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Upload Your Media
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload an image or video to detect and analyze lids and containers using our AI-powered vision system.
              </p>
            </div>

            <Upload onFileSelect={handleFileSelect} disabled={isProcessing} />

            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">{selectedFile.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                  <RunButton
                    onRun={handleRunAnalysis}
                    isProcessing={isProcessing}
                    hasFile={!!selectedFile}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Analysis Section */}
          {(selectedFile || results || isProcessing) && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Canvas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Media Preview & Detections
                </h3>
                <Canvas 
                  file={selectedFile} 
                  results={results} 
                  isProcessing={isProcessing} 
                />
              </div>

              {/* Results */}
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
            </section>
          )}

          {/* Info Section */}
          {!selectedFile && !results && !isProcessing && (
            <section className="text-center py-12">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Upload</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload your image or video containing lids and containers
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. Analyze</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our AI processes your media to detect and classify objects
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. Results</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View detailed detection results with bounding boxes and properties
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 Lid Vizion Demo. Built with Next.js 14 & TypeScript.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Mode: {isLive ? 'Production' : 'Simulation'}</span>
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
    </div>
  );
}